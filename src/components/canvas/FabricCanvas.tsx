import React, { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { useCanvasStore } from '../../store/useCanvasStore';

export const FabricCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Initialize Fabric Canvas
        // Using a ref to check if already initialized (Strict Mode protection)
        if (fabricRef.current) {
            return;
        }

        const canvas = new fabric.Canvas(canvasRef.current, {
            backgroundColor: '#1f1f1f', // Default dark gray
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
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
            // Cleanup
            if (fabricRef.current) {
                fabricRef.current.dispose();
                fabricRef.current = null;
            }
            resizeObserver.disconnect();
        };
    }, []);

    // Sync background color
    const backgroundColor = useCanvasStore((state) => state.backgroundColor);
    useEffect(() => {
        if (fabricRef.current) {
            fabricRef.current.backgroundColor = backgroundColor;
            fabricRef.current.renderAll();
        }
    }, [backgroundColor]);

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-neutral-200">
            <canvas ref={canvasRef} />
        </div>
    );
};
