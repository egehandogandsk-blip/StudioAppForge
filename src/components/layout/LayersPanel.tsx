import React from 'react';

export const LayersPanel: React.FC = () => {
    return (
        <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col z-10 shrink-0">
            <div className="h-10 border-b border-neutral-200 flex items-center px-4 font-semibold text-sm text-neutral-600">
                Layers
            </div>
            <div className="flex-1 p-2">
                {/* Layer items will go here */}
                <div className="text-xs text-neutral-500 italic p-2">No layers</div>
            </div>
        </aside>
    );
};
