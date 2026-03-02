"use client";

import { ReactNode } from "react";
import DashboardNav from "@/components/dashboard/dashboard-nav";
import { UserNav } from "@/components/layout/user-nav";
import { AiFab } from "@/components/dashboard/ai-assistant/ai-fab";
import { Logo } from "@/components/layout/logo";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#080c17] text-white selection:bg-blue-400/30 relative font-sans overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />
            <div className="bg-light-pillar left-[5%] top-[-10%] h-[70%] mix-blend-screen opacity-30 pointer-events-none fixed"></div>
            <div className="bg-light-pillar right-[10%] top-[20%] h-[60%] mix-blend-screen opacity-20 pointer-events-none fixed" style={{ background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%)' }}></div>

            {/* New Vertical Dashboard Nav */}
            <div className="relative z-40">
                <DashboardNav />
            </div>

            {/* Main Content Area - Pushed right to accommodate nav */}
            <div className="transition-all duration-500 ease-in-out pl-[80px] relative z-10 flex flex-col min-h-screen">

                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-black/20 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <Logo />
                    </div>

                    <div className="flex items-center gap-4">
                        <UserNav />
                    </div>
                </header>

                {/* Content */}
                <main className="p-6 lg:p-10 max-w-7xl mx-auto flex-grow w-full">
                    {children}
                </main>
                <div className="relative z-50">
                    <AiFab />
                </div>
            </div>
        </div>
    );
}
