import React, { useState } from 'react';
import { Send, Bot, Sparkles, SlidersHorizontal, Settings2 } from 'lucide-react';

export const ClaudeAssistantPanel: React.FC = () => {
    const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user', text: string }>>([
        { role: 'ai', text: 'Hello! I am Claude, your design and game development assistant. How can I help you perfect this project?' }
    ]);
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (!inputValue.trim()) return;
        
        setMessages([...messages, { role: 'user', text: inputValue }]);
        setInputValue('');
        
        // Mock AI response
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: 'Based on your prompt, I recommend filtering out "blurry" and "low-res" styles using the new Anti-Prompt Layer. Would you like me to sync this to your Unity bridge configuration?' 
            }]);
        }, 800);
    };

    return (
        <aside className="w-80 glass-panel flex flex-col z-10 shrink-0 border-l border-white/10 shadow-2xl">
            {/* Header */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-4">
                <div className="flex items-center gap-2 text-gray-100 font-semibold">
                    <Bot className="w-5 h-5 text-accent" />
                    Claude Assistant
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <Settings2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <SlidersHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col max-w-[90%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                        <div className={`text-xs text-gray-500 mb-1 flex items-center gap-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {msg.role === 'ai' ? <Sparkles className="w-3 h-3 text-accent" /> : <div className="w-3 h-3 bg-gray-500 rounded-full" />}
                            {msg.role === 'ai' ? 'Claude' : 'You'}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-accent/20 border border-accent/30 text-white rounded-br-none' 
                                : 'bg-black/30 border border-white/5 text-gray-300 rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10">
                <div className="relative">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Ask Claude about your design..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-accent/50 resize-none h-16"
                    />
                    <button 
                        onClick={handleSend}
                        className="absolute right-2 bottom-2 p-2 bg-accent hover:bg-accent/80 text-white rounded-lg shadow-glow transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-2 text-[10px] text-gray-500 text-center">
                    AI generated content may be inaccurate
                </div>
            </div>
        </aside>
    );
};
