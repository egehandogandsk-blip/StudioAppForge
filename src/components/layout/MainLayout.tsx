import React from 'react';
import { TopToolbar } from './TopToolbar';
import { LayersPanel } from './LayersPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { BottomToolbar } from '../canvas/BottomToolbar';
import { FabricCanvas } from '../canvas/FabricCanvas';
import { useToolStore } from '../../store/useToolStore';
import { ClaudeAssistantPanel } from './ClaudeAssistantPanel';

export const MainLayout: React.FC = () => {
    const rightPanelMode = useToolStore((state) => state.rightPanelMode);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-transparent text-gray-100 p-4 gap-4">
            {/* Top Toolbar */}
            <TopToolbar />

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden gap-4 relative">
                {/* Left Panel: Layers */}
                <LayersPanel />

                {/* Center: Canvas */}
                <main className="flex-1 relative overflow-hidden flex items-center justify-center rounded-2xl border border-white/5 bg-black/20 shadow-inner">
                    <FabricCanvas />
                    {/* Bottom Toolbar */}
                    <BottomToolbar />
                </main>

                {/* Right Panel: Properties or Claude */}
                {rightPanelMode === 'properties' ? (
                    <PropertiesPanel />
                ) : (
                    <ClaudeAssistantPanel />
                )}
            </div>
        </div>
    );
};
