import React from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';

export const PropertiesPanel: React.FC = () => {
    const { backgroundColor, setBackgroundColor } = useCanvasStore();

    return (
        <aside className="w-72 bg-white border-l border-neutral-200 flex flex-col z-10 shrink-0">
            <div className="h-10 border-b border-neutral-200 flex items-center px-4 font-semibold text-sm text-neutral-600">
                Properties
            </div>
            <div className="flex-1 p-4 flex flex-col gap-4">
                {/* Properties will go here */}
                <div className="text-xs text-neutral-500">Select an object to view properties</div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Canvas</label>
                    <div className="flex items-center gap-2">
                        <div className="text-sm text-neutral-700">Background</div>
                        <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-8 h-8 rounded border-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </aside>
    );
};
