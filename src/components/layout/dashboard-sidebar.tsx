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
                        className="fixed inset-0 bg-[#020617]/80 backdrop-blur-md z-[40] lg:hidden"
                    />

                    {/* Menu Container */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ duration: 0.5, ease: [0, 0.55, 0.45, 1] }}
                        className="fixed inset-y-0 left-0 w-full max-w-xs bg-[#0f172a]/95 border-r border-white/10 z-[45] flex flex-col p-6 shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-8 mt-2">
                            <Logo />
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white lg:hidden"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Book Appointment Section - PROMINENT */}
                        <div className="mb-8">
                            <button
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all group"
                                onClick={() => router.push('/dashboard/appointments')}
                            >
                                <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>Book Appointment</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2 px-2 mb-4 cursor-pointer hover:opacity-80" onClick={() => router.push('/dashboard/documents')}>
                            <FileText className="w-4 h-4 text-blue-500" />
                            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-200/40">My Documents</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                            {/* Placeholder Documents List */}


                            {recentDocs.map((doc: any) => (
                                <button
                                    key={doc.id}
                                    onClick={() => window.open(doc.fileUrl, '_blank')}
                                    className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all text-left flex items-start group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">{doc.name}</h3>
                                        <p className="text-xs text-blue-200/40 mt-1 truncate">{doc.category}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-blue-500 transition-colors mt-1 shrink-0 ml-2" />
                                </button>
                            ))}

                            <button
                                onClick={() => {
                                    console.log("Navigating to documents...");
                                    router.push('/dashboard/documents');
                                    onClose(); // Close sidebar on mobile
                                }}
                                className="relative z-50 w-full py-3 rounded-xl border border-dashed border-white/10 text-blue-200/40 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-sm font-bold flex items-center justify-center gap-2 mt-4 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Upload New Document</span>
                            </button>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/10">
                            <p className="text-xs text-center text-blue-200/20">
                                BioGuard Secure System v1.0
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
