import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useToolStore } from '../../store/useToolStore';

export const FabricCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [currentShape, setCurrentShape] = useState<fabric.Object | null>(null);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

    const { activeTool } = useToolStore();

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Initialize Fabric Canvas
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

        // Handle Resize
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

            // Disable object selection when not using cursor tool
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

    // Mouse event handlers for drawing
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const handleMouseDown = (event: any) => {
            if (activeTool === 'cursor') return;

            const pointer = canvas.getScenePoint(event.e);
            setIsDrawing(true);
            setStartPoint({ x: pointer.x, y: pointer.y });

            let shape: fabric.Object | null = null;

            switch (activeTool) {
                case 'rectangle':
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

                case 'ellipse':
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

                case 'frame':
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

                case 'line':
                    shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                        stroke: '#000000',
                        strokeWidth: 2,
                        selectable: false,
                    });
                    break;

                case 'text':
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
                    return;
            }

            if (shape) {
                setCurrentShape(shape);
                canvas.add(shape);
                canvas.renderAll();
            }
        };

        const handleMouseMove = (event: any) => {
            if (!isDrawing || !currentShape || !startPoint) return;

            const pointer = canvas.getScenePoint(event.e);
            const isShiftPressed = event.e.shiftKey;
            const isAltPressed = event.e.altKey;

            switch (activeTool) {
                case 'rectangle':
                case 'frame': {
                    const rect = currentShape as fabric.Rect;
                    let width = pointer.x - startPoint.x;
                    let height = pointer.y - startPoint.y;

                    // Shift: constrain to square
                    if (isShiftPressed) {
                        const size = Math.max(Math.abs(width), Math.abs(height));
                        width = width < 0 ? -size : size;
                        height = height < 0 ? -size : size;
                    }

                    // Alt: draw from center
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

                    // Shift: constrain to circle
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
            if (currentShape) {
                currentShape.set({ selectable: true });
                canvas.setActiveObject(currentShape);
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
    }, [activeTool, isDrawing, currentShape, startPoint]);

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-neutral-200">
            <canvas ref={canvasRef} />
        </div>
    );
};
