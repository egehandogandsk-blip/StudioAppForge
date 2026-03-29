import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useCanvasObjectsStore } from '../../store/useCanvasObjectsStore';
import { useToolStore } from '../../store/useToolStore';
import { useLayersStore } from '../../store/useLayersStore';
import type { Layer } from '../../store/useLayersStore';
import { useCanvasSync } from '../../hooks/useCanvasSync';

interface PenPoint {
    x: number;
    y: number;
    handleIn?: { x: number; y: number };
    handleOut?: { x: number; y: number };
}

export const FabricCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [currentShape, setCurrentShape] = useState<fabric.Object | null>(null);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    
    // Smart Guides state
    const [guides, setGuides] = useState<{ type: 'vertical' | 'horizontal', position: number }[]>([]);

    // Pen tool state
    const [penPath, setPenPath] = useState<fabric.Path | null>(null);
    const [penPoints, setPenPoints] = useState<PenPoint[]>([]);
    const [isDraggingHandle, setIsDraggingHandle] = useState(false);
    const [tempHandleCircle, setTempHandleCircle] = useState<fabric.Circle | null>(null);

    const { activeTool, setActiveTool } = useToolStore();
    const { addLayer, removeLayer, setLayers } = useLayersStore();

    // Initialize canvas sync
    const { syncToFirestore } = useCanvasSync({
        canvasRef: fabricRef,
    });

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        if (fabricRef.current) {
            return;
        }

        const canvas = new fabric.Canvas(canvasRef.current, {
            backgroundColor: '#1f1f1f',
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
            selection: activeTool === 'cursor',
        });

        fabricRef.current = canvas;

        // Helper function to get object type name
        const getObjectTypeName = (obj: fabric.Object): string => {
            if (obj.type === 'rect') return 'Rectangle';
            if (obj.type === 'circle') return 'Ellipse';
            if (obj.type === 'i-text' || obj.type === 'text') return 'Text';
            if (obj.type === 'line') return 'Line';
            if (obj.type === 'path') return 'Path';
            return obj.type || 'Object';
        };

        // Helper function to generate unique ID
        const generateLayerId = () => `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Track object additions
        canvas.on('object:added', (e) => {
            if (!e.target) return;

            // Check if layer already exists
            const existingLayer = useLayersStore.getState().layers.find(l => l.fabricObject === e.target);
            if (existingLayer) return;

            const obj = e.target;
            const layerId = generateLayerId();

            // Store layer ID in fabric object for reference
            obj.set('layerId', layerId);

            const layer: Layer = {
                id: layerId,
                name: getObjectTypeName(obj),
                type: obj.type || 'object',
                visible: obj.visible !== false,
                locked: obj.selectable === false,
                fabricObject: obj
            };

            addLayer(layer);
        });

        // Track object removals
        canvas.on('object:removed', (e) => {
            if (!e.target) return;
            const layerId = (e.target as any).layerId;
            if (layerId) {
                removeLayer(layerId);
            }
        });

        const syncLayers = () => {
            const objects = canvas.getObjects();
            const newLayers: Layer[] = objects.map((obj) => {
                let layerId = (obj as any).layerId;
                if (!layerId) {
                    layerId = generateLayerId();
                    obj.set('layerId', layerId);
                }

                return {
                    id: layerId,
                    name: getObjectTypeName(obj),
                    type: obj.type || 'object',
                    visible: obj.visible !== false,
                    locked: obj.selectable === false,
                    fabricObject: obj
                };
            });
            setLayers(newLayers);
        };

        syncLayers();

        // Listen for object modifications to sync to Firestore
        canvas.on('object:modified', () => {
            const objects = canvas.getObjects();
            syncToFirestore(objects);
            setGuides([]); // Clear drawing guides
        });

        // Smart Snapping & Guides Logic (object:moving)
        const SNAP_THRESHOLD = 5;
        
        canvas.on('object:moving', (e) => {
            const obj = e.target;
            if (!obj) return;

            // 1. Sub-pixel rounding (Math.round)
            let newLeft = Math.round(obj.left || 0);
            let newTop = Math.round(obj.top || 0);

            const activeGuides: { type: 'vertical' | 'horizontal', position: number }[] = [];
            
            if (canvas.width && canvas.height) {
                const canvasCenter = { x: canvas.width / 2, y: canvas.height / 2 };
                
                // Visible bounding box of moving object
                const objBounds = obj.getBoundingRect();
                
                // Get all other visible objects in viewport
                const objects = canvas.getObjects().filter(o => o !== obj && o.visible);
                
                let snappedX = false;
                let snappedY = false;

                // Canvas Center Snapping
                if (Math.abs(objBounds.left + objBounds.width / 2 - canvasCenter.x) < SNAP_THRESHOLD) {
                    newLeft = canvasCenter.x - objBounds.width / 2;
                    activeGuides.push({ type: 'vertical', position: canvasCenter.x });
                    snappedX = true;
                }
                if (Math.abs(objBounds.top + objBounds.height / 2 - canvasCenter.y) < SNAP_THRESHOLD) {
                    newTop = canvasCenter.y - objBounds.height / 2;
                    activeGuides.push({ type: 'horizontal', position: canvasCenter.y });
                    snappedY = true;
                }

                // 2. Magnetic Field Snapping (Euclidean Bounds overlap)
                objects.forEach(target => {
                    if (snappedX && snappedY) return; // Skip if already snapped in both axes
                    
                    const targetBounds = target.getBoundingRect();

                    // X-axis snapping
                    if (!snappedX) {
                        // Left to Left
                        if (Math.abs(objBounds.left - targetBounds.left) < SNAP_THRESHOLD) {
                            newLeft = targetBounds.left;
                            activeGuides.push({ type: 'vertical', position: targetBounds.left });
                            snappedX = true;
                        } 
                        // Right to Right
                        else if (Math.abs(objBounds.left + objBounds.width - targetBounds.left - targetBounds.width) < SNAP_THRESHOLD) {
                            newLeft = targetBounds.left + targetBounds.width - objBounds.width;
                            activeGuides.push({ type: 'vertical', position: targetBounds.left + targetBounds.width });
                            snappedX = true;
                        } 
                        // Center to Center
                        else if (Math.abs(objBounds.left + objBounds.width / 2 - (targetBounds.left + targetBounds.width / 2)) < SNAP_THRESHOLD) {
                            newLeft = targetBounds.left + targetBounds.width / 2 - objBounds.width / 2;
                            activeGuides.push({ type: 'vertical', position: targetBounds.left + targetBounds.width / 2 });
                            snappedX = true;
                        }
                    }

                    // Y-axis snapping
                    if (!snappedY) {
                        // Top to Top
                        if (Math.abs(objBounds.top - targetBounds.top) < SNAP_THRESHOLD) {
                            newTop = targetBounds.top;
                            activeGuides.push({ type: 'horizontal', position: targetBounds.top });
                            snappedY = true;
                        } 
                        // Bottom to Bottom
                        else if (Math.abs(objBounds.top + objBounds.height - targetBounds.top - targetBounds.height) < SNAP_THRESHOLD) {
                            newTop = targetBounds.top + targetBounds.height - objBounds.height;
                            activeGuides.push({ type: 'horizontal', position: targetBounds.top + targetBounds.height });
                            snappedY = true;
                        } 
                        // Center to Center
                        else if (Math.abs(objBounds.top + objBounds.height / 2 - (targetBounds.top + targetBounds.height / 2)) < SNAP_THRESHOLD) {
                            newTop = targetBounds.top + targetBounds.height / 2 - objBounds.height / 2;
                            activeGuides.push({ type: 'horizontal', position: targetBounds.top + targetBounds.height / 2 });
                            snappedY = true;
                        }
                    }
                });
            }

            obj.set({ left: newLeft, top: newTop });
            setGuides(activeGuides);
        });

        canvas.on('object:added', () => {
            const objects = canvas.getObjects();
            syncToFirestore(objects);
        });

        canvas.on('object:removed', () => {
            const objects = canvas.getObjects();
            syncToFirestore(objects);
        });

        const resizeObserver = new ResizeObserver(() => {
            if (containerRef.current && fabricRef.current) {
                fabricRef.current.setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
                fabricRef.current.renderAll();
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            if (fabricRef.current) {
                fabricRef.current.dispose();
                fabricRef.current = null;
            }
            resizeObserver.disconnect();
        };
    }, []);

    // Update canvas selection based on active tool
    useEffect(() => {
        if (fabricRef.current) {
            fabricRef.current.selection = activeTool === 'cursor';
            fabricRef.current.defaultCursor = activeTool === 'cursor' ? 'default' : 'crosshair';
            fabricRef.current.hoverCursor = activeTool === 'cursor' ? 'move' : 'crosshair';

            if (activeTool !== 'cursor') {
                fabricRef.current.discardActiveObject();
                fabricRef.current.renderAll();
            }
        }
    }, [activeTool]);

    // Sync background color
    const backgroundColor = useCanvasStore((state) => state.backgroundColor);
    useEffect(() => {
        if (fabricRef.current) {
            fabricRef.current.backgroundColor = backgroundColor;
            fabricRef.current.renderAll();
        }
    }, [backgroundColor]);

    // Track selected object
    const setSelectedObject = useCanvasObjectsStore((state) => state.setSelectedObject);

    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const handleSelectionCreated = (e: any) => {
            setSelectedObject(e.selected?.[0] || null);
        };

        const handleSelectionUpdated = (e: any) => {
            setSelectedObject(e.selected?.[0] || null);
        };

        const handleSelectionCleared = () => {
            setSelectedObject(null);
        };

        canvas.on('selection:created', handleSelectionCreated);
        canvas.on('selection:updated', handleSelectionUpdated);
        canvas.on('selection:cleared', handleSelectionCleared);

        return () => {
            canvas.off('selection:created', handleSelectionCreated);
            canvas.off('selection:updated', handleSelectionUpdated);
            canvas.off('selection:cleared', handleSelectionCleared);
        };
    }, [setSelectedObject]);

    // Convert pen points to SVG path string
    const pointsToPathString = (points: PenPoint[]): string => {
        if (points.length === 0) return '';

        let pathString = `M ${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];

            if (prev.handleOut && curr.handleIn) {
                // Cubic bezier curve
                pathString += ` C ${prev.handleOut.x} ${prev.handleOut.y}, ${curr.handleIn.x} ${curr.handleIn.y}, ${curr.x} ${curr.y}`;
            } else if (prev.handleOut) {
                // Quadratic-like with one handle
                pathString += ` Q ${prev.handleOut.x} ${prev.handleOut.y}, ${curr.x} ${curr.y}`;
            } else {
                // Straight line
                pathString += ` L ${curr.x} ${curr.y}`;
            }
        }

        return pathString;
    };

    // Finish pen path
    const finishPenPath = () => {
        const canvas = fabricRef.current;
        if (!canvas || !penPath) return;

        // Remove temp handle circle
        if (tempHandleCircle) {
            canvas.remove(tempHandleCircle);
            setTempHandleCircle(null);
        }

        penPath.set({ selectable: true });
        canvas.setActiveObject(penPath);
        setPenPath(null);
        setPenPoints([]);
        setActiveTool('cursor');
        canvas.renderAll();
    };

    // Keyboard shortcuts
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // Escape: Finish pen tool
            if (e.key === 'Escape') {
                if (penPath) {
                    finishPenPath();
                }
                return;
            }

            // Enter: Close path and finish
            if (e.key === 'Enter') {
                if (penPath && penPoints.length > 2) {
                    // Close the path
                    penPath.set({ path: pointsToPathString(penPoints) + ' Z' as any });
                    finishPenPath();
                }
                return;
            }

            const activeObject = canvas.getActiveObject();

            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (activeObject) {
                    canvas.remove(activeObject);
                    canvas.discardActiveObject();
                    canvas.renderAll();
                    setSelectedObject(null);
                }
            }

            const isMod = e.ctrlKey || e.metaKey;

            if (isMod) {
                switch (e.key.toLowerCase()) {
                    case 'a': {
                        e.preventDefault();
                        const allObjects = canvas.getObjects();
                        if (allObjects.length > 0) {
                            const selection = new fabric.ActiveSelection(allObjects, { canvas });
                            canvas.setActiveObject(selection);
                            canvas.renderAll();
                        }
                        break;
                    }

                    case 'c': {
                        e.preventDefault();
                        if (activeObject) {
                            (window as any).__clipboard = activeObject;
                        }
                        break;
                    }

                    case 'v': {
                        e.preventDefault();
                        const clipboard = (window as any).__clipboard;
                        if (clipboard) {
                            const json = JSON.stringify(clipboard.toObject());
                            const clonedProps = JSON.parse(json);

                            let cloned: fabric.Object | null = null;
                            if (clipboard.type === 'rect') {
                                cloned = new fabric.Rect(clonedProps);
                            } else if (clipboard.type === 'circle') {
                                cloned = new fabric.Circle(clonedProps);
                            } else if (clipboard.type === 'i-text') {
                                cloned = new fabric.IText(clonedProps.text, clonedProps);
                            } else if (clipboard.type === 'path') {
                                cloned = new fabric.Path(clonedProps.path, clonedProps);
                            }

                            if (cloned) {
                                cloned.set({
                                    left: (cloned.left || 0) + 20,
                                    top: (cloned.top || 0) + 20,
                                });
                                canvas.add(cloned);
                                canvas.setActiveObject(cloned);
                                canvas.renderAll();
                            }
                        }
                        break;
                    }

                    case 'z':
                        e.preventDefault();
                        console.log('Undo - To be implemented with history stack');
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setSelectedObject, penPath, penPoints]);

    // Canvas zoom with Ctrl + Mouse Wheel
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();

                const delta = e.deltaY;
                let zoom = canvas.getZoom();
                zoom *= 0.999 ** delta;

                if (zoom > 20) zoom = 20;
                if (zoom < 0.01) zoom = 0.01;

                canvas.zoomToPoint(new fabric.Point(e.offsetX, e.offsetY), zoom);
            }
        };

        const canvasElement = canvas.getElement().parentElement;
        canvasElement?.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            canvasElement?.removeEventListener('wheel', handleWheel);
        };
    }, []);

    // Mouse event handlers for drawing
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const handleMouseDown = (event: any) => {
            const pointer = canvas.getViewportPoint(event.e);

            if (activeTool === 'cursor') return;

            // Pen Tool Logic
            if (activeTool === 'pen') {
                setIsDrawing(false);
                setIsDraggingHandle(true);

                if (penPath === null) {
                    // Start new path
                    const newPoint: PenPoint = { x: pointer.x, y: pointer.y };
                    setPenPoints([newPoint]);

                    const pathString = `M ${pointer.x} ${pointer.y}`;
                    const path = new fabric.Path(pathString, {
                        stroke: '#000000',
                        strokeWidth: 2,
                        fill: '',
                        selectable: false,
                    });

                    canvas.add(path);
                    setPenPath(path);
                } else {
                    // Add new point
                    const newPoint: PenPoint = { x: pointer.x, y: pointer.y };
                    const updatedPoints = [...penPoints, newPoint];
                    setPenPoints(updatedPoints);

                    penPath.set({ path: pointsToPathString(updatedPoints) as any });
                    canvas.renderAll();
                }
                return;
            }

            // Other tools
            setIsDrawing(true);
            setStartPoint({ x: pointer.x, y: pointer.y });

            let shape: fabric.Object | null = null;

            switch (activeTool) {
                case 'rectangle': {
                    shape = new fabric.Rect({
                        left: pointer.x,
                        top: pointer.y,
                        width: 0,
                        height: 0,
                        fill: '#D9D9D9',
                        stroke: '#000000',
                        strokeWidth: 2,
                        selectable: false,
                    });
                    break;
                }

                case 'ellipse': {
                    shape = new fabric.Ellipse({
                        left: pointer.x,
                        top: pointer.y,
                        rx: 0,
                        ry: 0,
                        fill: '#D9D9D9',
                        stroke: '#000000',
                        strokeWidth: 2,
                        selectable: false,
                        originX: 'center',
                        originY: 'center',
                    });
                    break;
                }

                case 'frame': {
                    shape = new fabric.Rect({
                        left: pointer.x,
                        top: pointer.y,
                        width: 0,
                        height: 0,
                        fill: 'transparent',
                        stroke: '#6366F1',
                        strokeWidth: 2,
                        strokeDashArray: [5, 5],
                        selectable: false,
                    });
                    break;
                }

                case 'line': {
                    shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                        stroke: '#000000',
                        strokeWidth: 2,
                        selectable: false,
                    });
                    break;
                }

                case 'text': {
                    const text = new fabric.IText('Type something...', {
                        left: pointer.x,
                        top: pointer.y,
                        fontFamily: 'Inter',
                        fontSize: 16,
                        fill: '#000000',
                    });
                    canvas.add(text);
                    canvas.setActiveObject(text);
                    text.enterEditing();
                    text.selectAll();
                    canvas.renderAll();
                    setActiveTool('cursor');
                    return;
                }
            }

            if (shape) {
                setCurrentShape(shape);
                canvas.add(shape);
                canvas.renderAll();
            }
        };

        const handleMouseMove = (event: any) => {
            const pointer = canvas.getViewportPoint(event.e);

            // Pen tool: Handle dragging for bezier curves
            if (activeTool === 'pen' && isDraggingHandle && penPoints.length > 0) {
                const lastPoint = penPoints[penPoints.length - 1];
                const dx = pointer.x - lastPoint.x;
                const dy = pointer.y - lastPoint.y;

                // Create handle out for current point
                lastPoint.handleOut = { x: lastPoint.x + dx, y: lastPoint.y + dy };

                // Mirror handle in for smooth curve
                if (penPoints.length > 1) {
                    lastPoint.handleIn = { x: lastPoint.x - dx, y: lastPoint.y - dy };
                }

                // Show handle visualization
                if (!tempHandleCircle) {
                    const circle = new fabric.Circle({
                        left: pointer.x - 3,
                        top: pointer.y - 3,
                        radius: 3,
                        fill: '#6366F1',
                        selectable: false,
                    });
                    canvas.add(circle);
                    setTempHandleCircle(circle);
                } else {
                    tempHandleCircle.set({ left: pointer.x - 3, top: pointer.y - 3 });
                }

                setPenPoints([...penPoints]);
                if (penPath) {
                    penPath.set({ path: pointsToPathString(penPoints) as any });
                }
                canvas.renderAll();
                return;
            }

            // Pen tool: Preview line to cursor
            if (activeTool === 'pen' && penPath && penPoints.length > 0 && !isDraggingHandle) {
                let pathString = pointsToPathString(penPoints);
                pathString += ` L ${pointer.x} ${pointer.y}`;
                penPath.set({ path: pathString as any });
                canvas.renderAll();
                return;
            }

            if (!isDrawing || !currentShape || !startPoint) return;

            const isShiftPressed = event.e.shiftKey;
            const isAltPressed = event.e.altKey;

            switch (activeTool) {
                case 'rectangle':
                case 'frame': {
                    const rect = currentShape as fabric.Rect;
                    let width = pointer.x - startPoint.x;
                    let height = pointer.y - startPoint.y;

                    if (isShiftPressed) {
                        const size = Math.max(Math.abs(width), Math.abs(height));
                        width = width < 0 ? -size : size;
                        height = height < 0 ? -size : size;
                    }

                    if (isAltPressed) {
                        rect.set({
                            left: startPoint.x - Math.abs(width) / 2,
                            top: startPoint.y - Math.abs(height) / 2,
                            width: Math.abs(width),
                            height: Math.abs(height),
                        });
                    } else {
                        rect.set({
                            left: width < 0 ? pointer.x : startPoint.x,
                            top: height < 0 ? pointer.y : startPoint.y,
                            width: Math.abs(width),
                            height: Math.abs(height),
                        });
                    }
                    break;
                }

                case 'ellipse': {
                    const ellipse = currentShape as fabric.Ellipse;
                    let rx = Math.abs(pointer.x - startPoint.x) / 2;
                    let ry = Math.abs(pointer.y - startPoint.y) / 2;

                    if (isShiftPressed) {
                        const r = Math.max(rx, ry);
                        rx = r;
                        ry = r;
                    }

                    ellipse.set({
                        rx: rx,
                        ry: ry,
                        left: startPoint.x,
                        top: startPoint.y,
                    });
                    break;
                }

                case 'line': {
                    const line = currentShape as fabric.Line;
                    line.set({
                        x2: pointer.x,
                        y2: pointer.y,
                    });
                    break;
                }
            }

            canvas.renderAll();
        };

        const handleMouseUp = () => {
            // Pen tool: Finish handle dragging
            if (activeTool === 'pen' && isDraggingHandle) {
                setIsDraggingHandle(false);
                if (tempHandleCircle) {
                    canvas.remove(tempHandleCircle);
                    setTempHandleCircle(null);
                }
                canvas.renderAll();
                return;
            }

            if (currentShape) {
                currentShape.set({ selectable: true });
                canvas.setActiveObject(currentShape);
                setActiveTool('cursor');
            }
            setIsDrawing(false);
            setCurrentShape(null);
            setStartPoint(null);
            canvas.renderAll();
        };

        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);

        return () => {
            canvas.off('mouse:down', handleMouseDown);
            canvas.off('mouse:move', handleMouseMove);
            canvas.off('mouse:up', handleMouseUp);
        };
    }, [activeTool, isDrawing, currentShape, startPoint, setActiveTool, penPath, penPoints, isDraggingHandle, tempHandleCircle]);

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-transparent">
            {/* Grid Pattern Background */}
            <div 
                className="absolute inset-0 z-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: `${10}px ${10}px`,
                    backgroundPosition: 'center center'
                }}
            />
            
            <canvas ref={canvasRef} />

            {/* Smart Guides Overlay (React Layer) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-50">
                {guides.map((guide, i) => (
                    guide.type === 'vertical' ? (
                        <line 
                            key={`v-${i}`} 
                            x1={guide.position} 
                            y1="0" 
                            x2={guide.position} 
                            y2="100%" 
                            stroke="#d946ef" 
                            strokeWidth="1" 
                            strokeDasharray="4 4" 
                        />
                    ) : (
                        <line 
                            key={`h-${i}`} 
                            x1="0" 
                            y1={guide.position} 
                            x2="100%" 
                            y2={guide.position} 
                            stroke="#d946ef" 
                            strokeWidth="1" 
                            strokeDasharray="4 4" 
                        />
                    )
                ))}
            </svg>
        </div>
    );
};
