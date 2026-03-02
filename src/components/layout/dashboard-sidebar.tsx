"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Calendar, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface DashboardSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [recentDocs, setRecentDocs] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "documents"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(3)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRecentDocs(docs);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#080c17]/80 backdrop-blur-md z-[40] lg:hidden"
                    />

                    {/* Menu Container */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ duration: 0.5, ease: [0, 0.55, 0.45, 1] }}
                        className="fixed inset-y-0 left-0 w-full max-w-xs bg-[#080c17]/95 backdrop-blur-2xl border-r border-white/5 z-[45] flex flex-col p-6 shadow-[20px_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-8 mt-2">
                            <Logo />
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-colors text-white/60 hover:text-white lg:hidden"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Book Appointment Section - PROMINENT */}
                        <div className="mb-8">
                            <button
                                className="w-full bg-white text-black hover:bg-slate-200 font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 transition-all group scale-100 active:scale-95"
                                onClick={() => router.push('/dashboard/appointments')}
                            >
                                <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>Book Appointment</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2 px-2 mb-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push('/dashboard/documents')}>
                            <FileText className="w-4 h-4 text-blue-400" />
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/40">My Documents</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                            {recentDocs.map((doc: any) => (
                                <button
                                    key={doc.id}
                                    onClick={() => window.open(doc.fileUrl, '_blank')}
                                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all text-left flex items-start group shadow-lg"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold tracking-tight text-white group-hover:text-blue-400 transition-colors truncate">{doc.name}</h3>
                                        <p className="text-xs text-blue-200/40 mt-1 truncate">{doc.category}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-blue-400 transition-colors mt-1 shrink-0 ml-2" />
                                </button>
                            ))}

                            <button
                                onClick={() => {
                                    router.push('/dashboard/documents');
                                    onClose(); // Close sidebar on mobile
                                }}
                                className="relative z-50 w-full py-4 rounded-xl border border-dashed border-white/10 text-white/30 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all text-sm font-semibold flex items-center justify-center gap-2 mt-6 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Upload New Document</span>
                            </button>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/5">
                            <p className="text-[10px] uppercase tracking-widest text-center text-white/20 font-bold">
                                BioGuard System v1.0
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
