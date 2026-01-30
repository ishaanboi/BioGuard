"use client";

import { ReactNode } from "react";
import DashboardNav from "@/components/dashboard/dashboard-nav";
import { UserNav } from "@/components/layout/user-nav";
import { AiAssistant } from "@/components/dashboard/ai-assistant";
import { Logo } from "@/components/layout/logo";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
            {/* New Vertical Dashboard Nav */}
            <DashboardNav />

            {/* Main Content Area - Pushed right to accommodate nav */}
            <div className="transition-all duration-500 ease-in-out pl-[80px]">

                {/* Header */}
                <header className="h-20 border-b border-white/10 flex items-center justify-between px-6 lg:px-10 bg-[#020617]/50 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <Logo />
                    </div>

                    <div className="flex items-center gap-4">
                        <UserNav />
                    </div>
                </header>

                {/* Content */}
                <main className="p-6 lg:p-10 max-w-7xl mx-auto">
                    {children}
                </main>
                <AiAssistant />
            </div>
        </div>
    );
}
