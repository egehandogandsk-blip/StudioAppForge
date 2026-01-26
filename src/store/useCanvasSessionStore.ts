import { create } from 'zustand';

interface CanvasSessionState {
    currentSessionId: string | null;
    isOwner: boolean;
    setSessionId: (id: string | null) => void;
    setIsOwner: (isOwner: boolean) => void;
}

export const useCanvasSessionStore = create<CanvasSessionState>((set) => ({
    currentSessionId: null,
    isOwner: false,

    setSessionId: (id) => set({ currentSessionId: id }),
    setIsOwner: (isOwner) => set({ isOwner }),
}));
