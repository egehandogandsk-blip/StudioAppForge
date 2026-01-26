import { create } from 'zustand';

interface CanvasState {
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
    backgroundColor: '#1f1f1f',
    setBackgroundColor: (color) => set({ backgroundColor: color }),
}));
