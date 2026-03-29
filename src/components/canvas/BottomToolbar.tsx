import React, { useEffect, useRef } from 'react';
import { useToolStore } from '../../store/useToolStore';
import {
    MousePointer2,
    Square,
    Circle,
    Minus,
    MoveRight,
    Pentagon,
    Star,
    Type,
    PenTool,
    ChevronDown
} from 'lucide-react';

interface ToolButtonProps {
    tool: string;
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    onClick: () => void;
    active?: boolean;
    hasDropdown?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({
    icon,
    label,
    shortcut,
    onClick,
    active,
    hasDropdown
}) => {
    return (
        <button
            onClick={onClick}
            className={`relative flex items-center justify-center h-9 px-2 rounded-lg transition-colors ${active
                    ? 'bg-accent text-white shadow-glow'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
            title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
        >
            {icon}
            {hasDropdown && (
                <ChevronDown className="w-3 h-3 ml-1" />
            )}
        </button>
    );
};

export const BottomToolbar: React.FC = () => {
    const { activeTool, setActiveTool, shapeMenuOpen, setShapeMenuOpen } = useToolStore();
    const shapeMenuRef = useRef<HTMLDivElement>(null);

    // Close shape menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shapeMenuRef.current && !shapeMenuRef.current.contains(event.target as Node)) {
                setShapeMenuOpen(false);
            }
        };

        if (shapeMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [shapeMenuOpen, setShapeMenuOpen]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key.toLowerCase()) {
                case 'v':
                    setActiveTool('cursor');
                    break;
                case 'f':
                    setActiveTool('frame');
                    break;
                case 'r':
                    setActiveTool('rectangle');
                    break;
                case 'o':
                    setActiveTool('ellipse');
                    break;
                case 'l':
                    if (e.shiftKey) {
                        setActiveTool('arrow');
                    } else {
                        setActiveTool('line');
                    }
                    break;
                case 'p':
                    setActiveTool('pen');
                    break;
                case 't':
                    setActiveTool('text');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setActiveTool]);

    const shapeTools = [
        { tool: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: <Square className="w-4 h-4" /> },
        { tool: 'line', label: 'Line', shortcut: 'L', icon: <Minus className="w-4 h-4" /> },
        { tool: 'arrow', label: 'Arrow', shortcut: 'Shift+L', icon: <MoveRight className="w-4 h-4" /> },
        { tool: 'ellipse', label: 'Ellipse', shortcut: 'O', icon: <Circle className="w-4 h-4" /> },
        { tool: 'polygon', label: 'Polygon', shortcut: '', icon: <Pentagon className="w-4 h-4" /> },
        { tool: 'star', label: 'Star', shortcut: '', icon: <Star className="w-4 h-4" /> },
    ];

    const isShapeTool = ['rectangle', 'line', 'arrow', 'ellipse', 'polygon', 'star'].includes(activeTool);

    return (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40">
            <div className="glass-panel rounded-xl shadow-glow px-2 py-1 flex items-center gap-1">
                {/* Cursor Tool */}
                <ToolButton
                    tool="cursor"
                    icon={<MousePointer2 className="w-4 h-4" />}
                    label="Move"
                    shortcut="V"
                    onClick={() => setActiveTool('cursor')}
                    active={activeTool === 'cursor'}
                />

                {/* Frame Tool */}
                <ToolButton
                    tool="frame"
                    icon={<Square className="w-4 h-4" strokeDasharray="4" />}
                    label="Frame"
                    shortcut="F"
                    onClick={() => setActiveTool('frame')}
                    active={activeTool === 'frame'}
                />

                {/* Shape Tool with Dropdown */}
                <div className="relative" ref={shapeMenuRef}>
                    <ToolButton
                        tool="shape"
                        icon={<Square className="w-4 h-4" />}
                        label="Shape"
                        onClick={() => setShapeMenuOpen(!shapeMenuOpen)}
                        active={isShapeTool}
                        hasDropdown
                    />

                    {/* Shape Dropdown Menu */}
                    {shapeMenuOpen && (
                        <div className="absolute bottom-full mb-2 left-0 w-48 glass-panel py-2 z-50">
                            {shapeTools.map((shape) => (
                                <button
                                    key={shape.tool}
                                    onClick={() => {
                                        setActiveTool(shape.tool as typeof activeTool);
                                        setShapeMenuOpen(false);
                                    }}
                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between transition-colors ${activeTool === shape.tool
                                            ? 'bg-accent text-white'
                                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {shape.icon}
                                        <span>{shape.label}</span>
                                    </div>
                                    {shape.shortcut && (
                                        <span className="text-xs text-gray-500">{shape.shortcut}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pen Tool */}
                <ToolButton
                    tool="pen"
                    icon={<PenTool className="w-4 h-4" />}
                    label="Pen"
                    shortcut="P"
                    onClick={() => setActiveTool('pen')}
                    active={activeTool === 'pen'}
                />

                {/* Text Tool */}
                <ToolButton
                    tool="text"
                    icon={<Type className="w-4 h-4" />}
                    label="Text"
                    shortcut="T"
                    onClick={() => setActiveTool('text')}
                    active={activeTool === 'text'}
                />

                {/* Divider */}
                <div className="w-px h-6 bg-white/10 mx-1" />

                {/* Additional tools placeholder */}
                <div className="flex items-center gap-1 opacity-50">
                    <div className="w-8 h-8 rounded flex items-center justify-center text-neutral-500 text-xs">
                        ...
                    </div>
                </div>
            </div>
        </div>
    );
};
