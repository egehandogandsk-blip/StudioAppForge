import React, { useState, useRef, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { Undo, Redo, Download, FileImage, FileCode, ChevronRight } from 'lucide-react';
import { useHistoryStore } from '../../store/useHistoryStore';
import { ShareButton } from '../collaboration/ShareButton';

interface MenuItem {
    label: string;
    shortcut?: string;
    onClick: () => void;
    divider?: boolean;
    hasSubmenu?: boolean;
}

export const TopToolbar: React.FC = () => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const { user, setUser } = useAuthStore();
    const { past, future, undo, redo } = useHistoryStore();

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
            // Close dropdown if clicking outside
            if (activeDropdown && !(event.target as HTMLElement).closest('.dropdown-menu')) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileMenuOpen, activeDropdown]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setIsProfileMenuOpen(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleUndo = () => {
        const state = undo();
        // Canvas integration will be added
        console.log('Undo:', state);
    };

    const handleRedo = () => {
        const state = redo();
        console.log('Redo:', state);
    };

    const handleExportPNG = () => {
        console.log('Export PNG');
        setShowExportMenu(false);
    };

    const handleExportSVG = () => {
        console.log('Export SVG');
        setShowExportMenu(false);
    };

    const handleExportJSON = () => {
        console.log('Export JSON');
        setShowExportMenu(false);
    };

    const handleExportPDF = () => {
        console.log('Export PDF');
        setShowExportMenu(false);
    };

    // File Menu Items
    const fileMenuItems: MenuItem[] = [
        { label: 'New Canvas', onClick: () => console.log('New Canvas') },
        { label: 'Place Image', onClick: () => console.log('Place Image') },
        { label: 'Save local copy', onClick: () => console.log('Save local copy') },
        { label: 'Export PDF', onClick: handleExportPDF },
    ];

    // Edit Menu Items
    const editMenuItems: MenuItem[] = [
        { label: 'Undo', shortcut: 'Ctrl+Z', onClick: handleUndo },
        { label: 'Redo', shortcut: 'Ctrl+Shift+Z', onClick: handleRedo },
        { label: 'Copy', shortcut: 'Ctrl+C', onClick: () => console.log('Copy') },
        { label: 'Paste', shortcut: 'Ctrl+V', onClick: () => console.log('Paste') },
        { label: 'Delete', shortcut: 'Del', onClick: () => console.log('Delete') },
        { label: 'Find Asset', onClick: () => console.log('Find Asset') },
        { label: 'Select All', shortcut: 'Ctrl+A', onClick: () => console.log('Select All') },
    ];

    // View Menu Items (from uploaded image)
    const viewMenuItems: MenuItem[] = [
        { label: 'Pixel grid', shortcut: 'Shift+\'', onClick: () => console.log('Pixel grid') },
        { label: 'Layout guides', shortcut: 'Shift+G', onClick: () => console.log('Layout guides') },
        { label: 'Rulers', shortcut: 'Shift+R', onClick: () => console.log('Rulers') },
        { label: 'Show slices', onClick: () => console.log('Show slices'), divider: true },
        { label: 'Comments', shortcut: 'Shift+C', onClick: () => console.log('Comments') },
        { label: 'Annotations', shortcut: 'Shift+Y', onClick: () => console.log('Annotations') },
        { label: 'Outlines', onClick: () => console.log('Outlines'), hasSubmenu: true },
        { label: 'Pixel preview', shortcut: 'Ctrl+Shift+P', onClick: () => console.log('Pixel preview') },
        { label: 'Mask outlines', onClick: () => console.log('Mask outlines') },
        { label: 'Frame outlines', onClick: () => console.log('Frame outlines') },
        { label: 'Memory usage', onClick: () => console.log('Memory usage'), divider: true },
        { label: 'Additional labels', onClick: () => console.log('Additional labels') },
        { label: 'Minimize UI', shortcut: 'Ctrl+Shift+\\', onClick: () => console.log('Minimize UI') },
        { label: 'Show/Hide UI', shortcut: 'Ctrl+\\', onClick: () => console.log('Show/Hide UI') },
        { label: 'Multiplayer cursors', shortcut: 'Ctrl+Alt+\\', onClick: () => console.log('Multiplayer cursors') },
        { label: 'Switch to Draw', onClick: () => console.log('Switch to Draw') },
        { label: 'Switch to Dev Mode', shortcut: 'Shift+D', onClick: () => console.log('Switch to Dev Mode') },
        { label: 'Panels', onClick: () => console.log('Panels'), hasSubmenu: true, divider: true },
        { label: 'Zoom in', shortcut: 'Ctrl++', onClick: () => console.log('Zoom in') },
        { label: 'Zoom out', shortcut: 'Ctrl+-', onClick: () => console.log('Zoom out') },
        { label: 'Zoom to 100%', shortcut: 'Ctrl+0', onClick: () => console.log('Zoom to 100%') },
        { label: 'Zoom to fit', shortcut: 'Shift+1', onClick: () => console.log('Zoom to fit') },
        { label: 'Zoom to selection', shortcut: 'Shift+2', onClick: () => console.log('Zoom to selection'), divider: true },
        { label: 'Previous page', shortcut: 'Page Up', onClick: () => console.log('Previous page') },
        { label: 'Next page', shortcut: 'Page Down', onClick: () => console.log('Next page') },
        { label: 'Zoom to previous frame', shortcut: 'Shift+N', onClick: () => console.log('Zoom to previous frame') },
        { label: 'Zoom to next frame', shortcut: 'N', onClick: () => console.log('Zoom to next frame') },
        { label: 'Find previous frame', shortcut: 'Home', onClick: () => console.log('Find previous frame') },
        { label: 'Find next frame', shortcut: 'End', onClick: () => console.log('Find next frame') },
    ];

    const profileMenuItems = [
        { label: 'Profile', icon: '👤', onClick: () => console.log('Profile clicked') },
        { label: 'Token', icon: '🔑', onClick: () => console.log('Token clicked') },
        { label: 'Settings', icon: '⚙️', onClick: () => console.log('Settings clicked') },
        { label: 'Log out', icon: '🚪', onClick: handleLogout, danger: true },
    ];

    const renderDropdownMenu = (items: MenuItem[]) => {
        return (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-2xl border border-neutral-200 py-2 z-50 dropdown-menu">
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        <button
                            onClick={item.onClick}
                            className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center justify-between"
                        >
                            <span className="flex items-center gap-2">
                                {item.label}
                                {item.hasSubmenu && <ChevronRight className="w-3 h-3" />}
                            </span>
                            {item.shortcut && (
                                <span className="text-xs text-neutral-400">{item.shortcut}</span>
                            )}
                        </button>
                        {item.divider && <div className="border-t border-neutral-200 my-1" />}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <header className="h-10 bg-white border-b border-neutral-200 flex items-center px-4 justify-between z-50 shrink-0 relative">
            {/* Left: Logo + Menu Items */}
            <div className="flex items-center gap-1">
                <div className="font-bold text-lg tracking-wider text-indigo-600 mr-3">forge</div>

                {/* File Menu */}
                <div className="relative">
                    <button
                        onClick={() => setActiveDropdown(activeDropdown === 'file' ? null : 'file')}
                        className="px-2 py-1 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                    >
                        File
                    </button>
                    {activeDropdown === 'file' && renderDropdownMenu(fileMenuItems)}
                </div>

                {/* Edit Menu */}
                <div className="relative">
                    <button
                        onClick={() => setActiveDropdown(activeDropdown === 'edit' ? null : 'edit')}
                        className="px-2 py-1 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                    >
                        Edit
                    </button>
                    {activeDropdown === 'edit' && renderDropdownMenu(editMenuItems)}
                </div>

                {/* View Menu */}
                <div className="relative">
                    <button
                        onClick={() => setActiveDropdown(activeDropdown === 'view' ? null : 'view')}
                        className="px-2 py-1 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                    >
                        View
                    </button>
                    {activeDropdown === 'view' && renderDropdownMenu(viewMenuItems)}
                </div>
            </div>

            {/* Right: Actions + Profile */}
            <div className="flex items-center gap-2">
                {/* Undo Button */}
                <button
                    onClick={handleUndo}
                    disabled={past.length === 0}
                    className={`p-1.5 rounded transition-colors ${past.length > 0
                        ? 'hover:bg-neutral-100 text-neutral-700'
                        : 'text-neutral-300 cursor-not-allowed'
                        }`}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo className="w-4 h-4" />
                </button>

                {/* Redo Button */}
                <button
                    onClick={handleRedo}
                    disabled={future.length === 0}
                    className={`p-1.5 rounded transition-colors ${future.length > 0
                        ? 'hover:bg-neutral-100 text-neutral-700'
                        : 'text-neutral-300 cursor-not-allowed'
                        }`}
                    title="Redo (Ctrl+Shift+Z)"
                >
                    <Redo className="w-4 h-4" />
                </button>

                {/* Share Button */}
                <ShareButton />

                {/* Export Menu */}
                <div className="relative" ref={exportMenuRef}>
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="px-2 py-1 text-sm bg-neutral-800 hover:bg-neutral-700 text-white rounded flex items-center gap-1.5 transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>

                    {showExportMenu && (
                        <div className="absolute top-full right-0 mt-1 w-44 bg-neutral-900 rounded-lg shadow-2xl border border-neutral-800 py-2 z-50">
                            <button
                                onClick={handleExportPNG}
                                className="w-full px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors flex items-center gap-3"
                            >
                                <FileImage className="w-4 h-4" />
                                Export as PNG
                            </button>
                            <button
                                onClick={handleExportSVG}
                                className="w-full px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors flex items-center gap-3"
                            >
                                <FileCode className="w-4 h-4" />
                                Export as SVG
                            </button>
                            <button
                                onClick={handleExportJSON}
                                className="w-full px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors flex items-center gap-3"
                            >
                                <FileCode className="w-4 h-4" />
                                Export as JSON
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="w-full px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors flex items-center gap-3"
                            >
                                <FileCode className="w-4 h-4" />
                                Export as PDF
                            </button>
                        </div>
                    )}
                </div>

                {/* User Profile with Dropdown */}
                <div className="relative ml-2" ref={menuRef}>
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white hover:scale-110 transition-transform duration-200 cursor-pointer"
                        title={user?.displayName || user?.email || 'User'}
                    >
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <span>{user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}</span>
                        )}
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-2xl border border-neutral-200 py-2 z-[9999]">
                            {/* User Info Header */}
                            <div className="px-4 py-2 border-b border-neutral-200">
                                <p className="text-sm font-semibold text-neutral-800 truncate">
                                    {user?.displayName || 'User'}
                                </p>
                                <p className="text-xs text-neutral-500 truncate">
                                    {user?.email || 'dev@localhost'}
                                </p>
                            </div>

                            {/* Menu Items */}
                            {profileMenuItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={item.onClick}
                                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${item.danger
                                        ? 'text-red-600 hover:bg-red-50'
                                        : 'text-neutral-700 hover:bg-neutral-100'
                                        }`}
                                >
                                    <span className="text-base">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
