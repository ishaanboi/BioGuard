"use client";

import { ReactNode } from "react";
import { BrainCircuit } from "lucide-react";
import Link from "next/link";
import Iridescence from "@/components/ui/Iridescence";

interface SplitAuthLayoutProps {
    children: ReactNode;
    quote: string;
    author: string;
}

export function SplitAuthLayout({ children, quote, author }: SplitAuthLayoutProps) {
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#07011a] overflow-hidden selection:bg-primary/30">
            {/* Left Column: Form Section */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 lg:p-16 xl:p-24 relative z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#120530] to-[#07011a] -z-10" />

                <div className="max-w-md w-full mx-auto relative text-center">
                    <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                        <BrainCircuit className="h-10 w-10 text-blue-500" />
                        <span className="text-3xl font-bold text-white drop-shadow-md tracking-tight">BioGuard</span>
                    </Link>

                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-left">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                        {children}
                    </div>
                </div>
            </div>

            {/* Right Column: Visual Section with Iridescence */}
            <div className="hidden md:flex w-1/2 relative overflow-hidden items-center justify-center">
                {/* Background Base */}
                <div className="absolute inset-0 bg-[#07011a] -z-20" />

                {/* The Iridescence Background */}
                <div className="absolute inset-0">
                    <Iridescence
                        color={[0.05, 0.15, 0.3]} // Deep Dark Blue for eye comfort
                        mouseReact={false}
                        amplitude={0.15}
                        speed={1.0}
                    />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 text-center space-y-10 max-w-lg p-12 lg:p-24 bg-black/20 backdrop-blur-md rounded-[3rem] border border-white/5 shadow-2xl">
                    <div className="space-y-6">
                        <h2 className="text-4xl lg:text-5xl xl:text-6xl font-quote italic text-white leading-[1.2] tracking-tight drop-shadow-2xl">
                            {quote}
                        </h2>
                        <div className="flex justify-center">
                            <div className="h-1.5 w-20 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full shadow-[0_0_20px_rgba(59,130,246,0.7)]" />
                        </div>
                        <p className="text-xl text-blue-200/50 italic font-medium tracking-wide">
                            — {author}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
