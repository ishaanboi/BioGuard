'use client';

import { useState, useEffect } from 'react';
import { Bot, FileSearch, X, Sparkles, Maximize2, Minimize2, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMode } from './chat-mode';
import { AnalyzeMode } from './analyze-mode';

interface AiWindowProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AiWindow({ isOpen, onClose }: AiWindowProps) {
    const [mode, setMode] = useState<'home' | 'chat' | 'analyze'>('home');
    const [isExpanded, setIsExpanded] = useState(false);

    // Reset to home when closed
    useEffect(() => {
        if (!isOpen) {
            const t = setTimeout(() => setMode('home'), 300);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className={cn(
                "fixed bottom-28 right-6 bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 animate-in slide-in-from-bottom-10 fade-in",
                isExpanded ? "w-[600px] h-[80vh]" : "w-[400px] h-[600px]"
            )}
        >
            {/* Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 shrink-0">
                <div className="flex items-center gap-3">
                    {mode !== 'home' && (
                        <button
                            onClick={() => setMode('home')}
                            className="mr-1 p-1 hover:bg-white/10 rounded-full text-blue-200 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-4 h-4 text-white fill-white" />
                    </div>
                    <span className="font-headline font-bold text-lg text-white">BioGuard AI</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 hover:bg-white/10 rounded-full text-blue-200/50 hover:text-white transition-colors"
                    >
                        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-red-500/20 rounded-full text-blue-200/50 hover:text-red-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-[#0f172a]/50 flex flex-col">
                {mode === 'home' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold text-white">Hello! 👋</h3>
                            <p className="text-blue-200/60">How can I assist you today?</p>
                        </div>

                        <div className="grid grid-cols-1 w-full gap-4">
                            <button
                                onClick={() => setMode('chat')}
                                className="group p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:border-blue-400 hover:bg-blue-500/20 transition-all text-left flex items-start gap-4 shadow-lg hover:shadow-blue-500/10"
                            >
                                <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <Bot className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <span className="block font-bold text-lg text-white mb-1">Health Chatbot</span>
                                    <span className="text-sm text-blue-200/60 leading-relaxed">Ask generic health questions, check symptoms, or get wellness tips.</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setMode('analyze')}
                                className="group p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 hover:border-purple-400 hover:bg-purple-500/20 transition-all text-left flex items-start gap-4 shadow-lg hover:shadow-purple-500/10"
                            >
                                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <FileSearch className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <span className="block font-bold text-lg text-white mb-1">Report Analyzer</span>
                                    <span className="text-sm text-purple-200/60 leading-relaxed">Upload lab reports or prescriptions for instant AI summaries.</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {mode === 'chat' && <ChatMode />}
                {mode === 'analyze' && <AnalyzeMode />}
            </div>

            {/* Bottom Tabs - Only show when NOT in home mode */}
            {mode !== 'home' && (
                <div className="h-16 bg-[#0f172a] border-t border-white/10 flex p-2 gap-2 shrink-0">
                    <button
                        onClick={() => setMode('chat')}
                        className={cn(
                            "flex-1 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all",
                            mode === 'chat'
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "bg-transparent text-blue-200/50 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <Bot className="w-4 h-4" />
                        Chat
                    </button>
                    <button
                        onClick={() => setMode('analyze')}
                        className={cn(
                            "flex-1 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all",
                            mode === 'analyze'
                                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                                : "bg-transparent text-blue-200/50 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <FileSearch className="w-4 h-4" />
                        Analyze
                    </button>
                </div>
            )}
        </div>
    );
}
