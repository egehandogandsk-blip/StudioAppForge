import { create } from 'zustand';

export type ToolType =
    | 'cursor'
    | 'frame'
    | 'rectangle'
    | 'ellipse'
    | 'line'
    | 'arrow'
    | 'polygon'
    | 'star'
    | 'pen'
    | 'text';

interface ToolStore {
    activeTool: ToolType;
    setActiveTool: (tool: ToolType) => void;
    isDrawing: boolean;
    setIsDrawing: (value: boolean) => void;
    shapeMenuOpen: boolean;
    setShapeMenuOpen: (value: boolean) => void;
    rightPanelMode: 'properties' | 'claude';
    setRightPanelMode: (mode: 'properties' | 'claude') => void;
}

export const useToolStore = create<ToolStore>((set) => ({
    activeTool: 'cursor',
    setActiveTool: (tool) => set({ activeTool: tool, shapeMenuOpen: false }),
    isDrawing: false,
    setIsDrawing: (value) => set({ isDrawing: value }),
    shapeMenuOpen: false,
    setShapeMenuOpen: (value) => set({ shapeMenuOpen: value }),
    rightPanelMode: 'properties',
    setRightPanelMode: (mode) => set({ rightPanelMode: mode }),
}));
