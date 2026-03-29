import React, { useState } from 'react';
import { GripVertical, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { useLayersStore } from '../../store/useLayersStore';

export const LayersPanel: React.FC = () => {
    const { layers, selectedLayerId, setSelectedLayer, updateLayer, reorderLayers } = useLayersStore();
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        reorderLayers(draggedIndex, dropIndex);

        // Update canvas z-order
        const reorderedLayers = [...layers];
        const [movedLayer] = reorderedLayers.splice(draggedIndex, 1);
        reorderedLayers.splice(dropIndex, 0, movedLayer);

        // Update z-index in canvas (index 0 = back, last index = front)
        reorderedLayers.forEach((layer, idx) => {
            if (layer.fabricObject && layer.fabricObject.canvas) {
                const canvas = layer.fabricObject.canvas;
                const objects = canvas.getObjects();
                const currentIndex = objects.indexOf(layer.fabricObject);
                if (currentIndex !== -1) {
                    canvas.moveTo(layer.fabricObject, idx);
                }
            }
        });

        setDraggedIndex(null);
    };

    const handleToggleVisibility = (id: string) => {
        const layer = layers.find(l => l.id === id);
        if (!layer) return;

        const newVisible = !layer.visible;
        updateLayer(id, { visible: newVisible });

        if (layer.fabricObject) {
            layer.fabricObject.set({ visible: newVisible });
            layer.fabricObject.canvas?.renderAll();
        }
    };

    const handleToggleLock = (id: string) => {
        const layer = layers.find(l => l.id === id);
        if (!layer) return;

        const newLocked = !layer.locked;
        updateLayer(id, { locked: newLocked });

        if (layer.fabricObject) {
            layer.fabricObject.set({
                selectable: !newLocked,
                evented: !newLocked
            });
            layer.fabricObject.canvas?.renderAll();
        }
    };

    const handleLayerSelect = (id: string) => {
        setSelectedLayer(id);
        const layer = layers.find(l => l.id === id);
        if (layer?.fabricObject) {
            const canvas = layer.fabricObject.canvas;
            if (canvas) {
                canvas.setActiveObject(layer.fabricObject);
                canvas.renderAll();
            }
        }
    };

    return (
        <aside className="w-64 glass-panel flex flex-col z-10 shrink-0">
            <div className="h-10 border-b border-white/10 flex items-center px-4 font-semibold text-sm text-gray-300">
                Layers
            </div>

            <div className="flex-1 overflow-y-auto py-2">
                {layers.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-neutral-400">
                        No layers yet
                    </div>
                ) : (
                    layers.map((layer, index) => (
                        <div
                            key={layer.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            className={`flex items-center gap-2 px-2 py-2 mx-2 mb-1 rounded-lg transition-all cursor-pointer ${selectedLayerId === layer.id
                                    ? 'bg-accent/20 border border-accent/30'
                                    : draggedIndex === index
                                        ? 'opacity-50'
                                        : 'hover:bg-white/5'
                                }`}
                            onClick={() => handleLayerSelect(layer.id)}
                        >
                            {/* Drag Handle */}
                            <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
                                <GripVertical className="w-4 h-4" />
                            </div>

                            {/* Layer Info */}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-200 truncate">
                                    {layer.name}
                                </div>
                                <div className="text-xs text-gray-500">{layer.type}</div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleVisibility(layer.id);
                                    }}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                                >
                                    {layer.visible ? (
                                        <Eye className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <EyeOff className="w-4 h-4 text-gray-600" />
                                    )}
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleLock(layer.id);
                                    }}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                    title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                                >
                                    {layer.locked ? (
                                        <Lock className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <Unlock className="w-4 h-4 text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
};
