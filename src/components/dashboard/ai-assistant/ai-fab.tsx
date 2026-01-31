'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AiWindow } from './ai-window';
import { cn } from '@/lib/utils'; // Ensure this exists

export function AiFab() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
                {/* Pulse Effect Background */}
                {!isOpen && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20 animate-ping -z-10"></span>
                )}

                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    size="icon"
                    className={cn(
                        "h-20 w-20 rounded-full shadow-2xl transition-all duration-300 hover:scale-105",
                        isOpen
                            ? "bg-red-500 hover:bg-red-600 rotate-90"
                            : "bg-gradient-to-tr from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                    )}
                >
                    {isOpen ? (
                        <X className="h-8 w-8 text-white" />
                    ) : (
                        <Sparkles className="h-8 w-8 text-white fill-white animate-pulse" />
                    )}
                </Button>
            </div>

            <AiWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
