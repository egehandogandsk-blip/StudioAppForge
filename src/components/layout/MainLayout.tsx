import React from 'react';
import { TopToolbar } from './TopToolbar';
import { LayersPanel } from './LayersPanel';
import { PropertiesPanel } from './PropertiesPanel';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-50 text-neutral-900">
            {/* Top Toolbar */}
            <TopToolbar />

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Layers */}
                <LayersPanel />

                {/* Center: Canvas */}
                <main className="flex-1 relative bg-neutral-200 overflow-hidden flex items-center justify-center">
                    {children}
                </main>

                {/* Right Panel: Properties */}
                <PropertiesPanel />
            </div>
        </div>
    );
};
