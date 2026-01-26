import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCanvasSessionStore } from '../../store/useCanvasSessionStore';

export const ShareButton: React.FC = () => {
    const { currentSessionId } = useCanvasSessionStore();
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (!currentSessionId) {
            toast.error('No active canvas to share');
            return;
        }

        const shareUrl = `${window.location.origin}/canvas/${currentSessionId}`;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Link copied to clipboard!');

            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy link');
            console.error('Copy failed:', error);
        }
    };

    if (!currentSessionId) return null;

    return (
        <button
            onClick={handleShare}
            className="px-2 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center gap-1.5 transition-colors"
            title="Share canvas"
        >
            {copied ? (
                <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                </>
            ) : (
                <>
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                </>
            )}
        </button>
    );
};
