import React from 'react';

export const TopToolbar: React.FC = () => {
    return (
        <header className="h-12 bg-white border-b border-neutral-200 flex items-center px-4 justify-between z-10 shrink-0">
            <div className="font-bold text-lg tracking-wider text-indigo-600">forge</div>
            <div className="flex gap-2">
                {/* Placeholder tools */}
                <button className="p-1.5 hover:bg-neutral-100 rounded text-neutral-600 hover:text-neutral-900 transition-colors">File</button>
                <button className="p-1.5 hover:bg-neutral-100 rounded text-neutral-600 hover:text-neutral-900 transition-colors">Edit</button>
                <button className="p-1.5 hover:bg-neutral-100 rounded text-neutral-600 hover:text-neutral-900 transition-colors">View</button>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white">U</div>
        </header>
    );
};
