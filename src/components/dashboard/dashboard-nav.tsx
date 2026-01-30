"use client";
import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowUpRight, Menu, X, FileText, Calendar, Newspaper } from 'lucide-react';
import Link from 'next/link';

// Vertical implementation of ReactBits CardNav
const DashboardNav = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ paused: true });

            // Animate Width instead of Height for Vertical Sidebar
            tl.to(navRef.current, {
                width: 320, // Expanded width
                duration: 0.5,
                ease: "power3.inOut"
            });

            // Fade in content
            tl.fromTo(".nav-content",
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.3, stagger: 0.1 },
                "-=0.3"
            );

            tlRef.current = tl;
        }, navRef);

        return () => ctx.revert();
    }, []);

    const toggleMenu = () => {
        if (!tlRef.current) return;

        if (!isExpanded) {
            setIsExpanded(true);
            tlRef.current.play();
        } else {
            // setIsExpanded(false) happens after reverse? 
            // Actually usually better to set state immediately or after.
            // For GSAP, usually we just play/reverse.
            setIsExpanded(false);
            tlRef.current.reverse();
        }
    };

    return (
        <div
            ref={navRef}
            className="fixed top-4 left-4 h-[calc(100vh-2rem)] w-[60px] bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            style={{ willChange: 'width' }}
        >
            {/* Header / Toggle */}
            <div className="flex-shrink-0 h-[60px] flex items-center justify-between px-[18px]">
                <button
                    onClick={toggleMenu}
                    className="text-white hover:text-blue-400 transition-colors"
                >
                    {isExpanded ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Content Container */}
            <div className="nav-content flex-1 flex flex-col gap-4 p-4 opacity-0 min-w-[320px]">
                {/* My Documents Card */}
                <Link href="/dashboard/documents" className="group">
                    <div className="bg-[#1e293b] hover:bg-[#334155] p-5 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <FileText className="text-blue-400" size={20} />
                            </div>
                            <ArrowUpRight className="text-white/30 group-hover:text-white transition-colors" size={18} />
                        </div>
                        <h3 className="text-white font-medium text-lg">My Documents</h3>
                        <p className="text-blue-200/50 text-sm mt-1">Manage reports & x-rays</p>
                    </div>
                </Link>

                {/* Book Appointment Card */}
                <Link href="/dashboard/appointments" className="group">
                    <div className="bg-[#1e293b] hover:bg-[#334155] p-5 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Calendar className="text-purple-400" size={20} />
                            </div>
                            <ArrowUpRight className="text-white/30 group-hover:text-white transition-colors" size={18} />
                        </div>
                        <h3 className="text-white font-medium text-lg">Book Appointment</h3>
                        <p className="text-blue-200/50 text-sm mt-1">Schedule visit with doctor</p>
                    </div>
                </Link>
                {/* Health News Card */}
                <Link href="/dashboard/news" className="group">
                    <div className="bg-[#1e293b] hover:bg-[#334155] p-5 rounded-xl border border-white/5 hover:border-green-500/30 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <Newspaper className="text-green-400" size={20} />
                            </div>
                            <ArrowUpRight className="text-white/30 group-hover:text-white transition-colors" size={18} />
                        </div>
                        <h3 className="text-white font-medium text-lg">Health News</h3>
                        <p className="text-blue-200/50 text-sm mt-1">Latest medical updates</p>
                    </div>
                </Link>
            </div>

            {/* Footer or Logo (Optional) */}
            <div className="flex-shrink-0 p-4 border-t border-white/5 nav-content opacity-0">
                <p className="text-xs text-center text-white/20">BioGuard System</p>
            </div>
        </div>
    );
};

export default DashboardNav;
