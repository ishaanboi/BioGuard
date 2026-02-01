"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, FileText, ChevronRight, Activity, Beaker, FileHeart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { db } from "@/firebase/config";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { analyzeText } from "@/app/actions/analyze-document";
import { Logo } from "@/components/layout/logo";

export function AiAssistant() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'category' | 'document' | 'analysis'>('category');
    const [selectedCategory, setSelectedCategory] = useState("");
    const [documents, setDocuments] = useState<any[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [analysis, setAnalysis] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch documents when category is selected
    useEffect(() => {
        if (selectedCategory && user) {
            const fetchDocs = async () => {
                setLoading(true);
                const q = query(
                    collection(db, "documents"),
                    where("userId", "==", user.uid),
                    where("category", "==", selectedCategory),
                    orderBy("createdAt", "desc")
                );
                const snapshot = await getDocs(q);
                setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
            };
            fetchDocs();
        }
    }, [selectedCategory, user]);

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        setStep('document');
    };

    const handleDocumentSelect = async (doc: any) => {
        setSelectedDoc(doc);
        setStep('analysis');
        setLoading(true);
        // Trigger AI Analysis
        const result = await analyzeText(doc.summary || doc.name);
        setAnalysis(result);
        setLoading(false);
    };

    const reset = () => {
        setStep('category');
        setSelectedCategory("");
        setSelectedDoc(null);
        setAnalysis("");
    };

    const renderStep = () => {
        switch (step) {
            case 'category':
                return (
                    <div className="grid grid-cols-2 gap-4 py-4">
                        {[
                            { name: "Lab Report", icon: Beaker, color: "text-blue-400", bg: "bg-blue-500/10" },
                            { name: "Prescription", icon: FileHeart, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                            { name: "Imaging", icon: Activity, color: "text-purple-400", bg: "bg-purple-500/10" },
                            { name: "Insurance", icon: Shield, color: "text-amber-400", bg: "bg-amber-500/10" },
                        ].map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => handleCategorySelect(cat.name)}
                                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex flex-col items-center gap-3 group text-center"
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cat.bg} group-hover:scale-110 transition-transform`}>
                                    <cat.icon className={`w-6 h-6 ${cat.color}`} />
                                </div>
                                <span className="font-semibold text-white/90">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                );
            case 'document':
                return (
                    <div className="py-4 space-y-2 max-h-[400px] overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4 text-blue-200/50 cursor-pointer hover:text-white transition-colors" onClick={() => setStep('category')}>
                            <span className="text-xs uppercase font-bold tracking-wider">← Back to Categories</span>
                        </div>
                        {loading ? (
                            <div className="text-center py-8 text-blue-200/50 animate-pulse">Finding documents...</div>
                        ) : documents.length === 0 ? (
                            <div className="text-center py-8 text-blue-200/50">
                                No {selectedCategory} documents found.
                            </div>
                        ) : (
                            documents.map((doc) => (
                                <button
                                    key={doc.id}
                                    onClick={() => handleDocumentSelect(doc)}
                                    className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all text-left flex items-start group"
                                >
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 shrink-0">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">{doc.name}</h3>
                                        <p className="text-xs text-blue-200/40 mt-1 truncate">Uploaded {doc.createdAt ? new Date(doc.createdAt.toDate()).toLocaleDateString() : 'Just now'}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-blue-500 transition-colors mt-2" />
                                </button>
                            ))
                        )}
                    </div>
                );
            case 'analysis':
                return (
                    <div className="py-4 space-y-4">
                        <div className="flex items-center gap-2 mb-2 text-blue-200/50 cursor-pointer hover:text-white transition-colors" onClick={() => setStep('document')}>
                            <span className="text-xs uppercase font-bold tracking-wider">← Back to Documents</span>
                        </div>

                        <div className="bg-black/40 rounded-xl p-6 border border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                                <h3 className="font-bold text-white text-lg">AI Insight</h3>
                            </div>
                            {loading ? (
                                <div className="space-y-2">
                                    <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                                    <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                                    <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse" />
                                </div>
                            ) : (
                                <p className="text-blue-200/80 leading-relaxed type-animation">
                                    {analysis}
                                </p>
                            )}
                        </div>

                        {!loading && (
                            <div className="flex justify-end">
                                <Button className="bg-blue-600 hover:bg-blue-500" onClick={reset}>
                                    Start Over
                                </Button>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => {
                    setIsOpen(true);
                    reset();
                }}
                className="fixed bottom-8 left-8 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-110 transition-transform group border border-white/20"
            >
                <Sparkles className="w-7 h-7 text-white" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-[#020617] animate-pulse" />
            </button>

            {/* Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-[#0f172a]/95 backdrop-blur-xl border-white/10 text-white sm:max-w-2xl md:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-headline font-bold flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-400" />
                            BioGuard AI Assistant
                        </DialogTitle>
                        <DialogDescription className="text-blue-200/60">
                            {step === 'category' && "What type of document should I analyze?"}
                            {step === 'document' && "Select a file to process"}
                            {step === 'analysis' && "Analysis Complete"}
                        </DialogDescription>
                    </DialogHeader>

                    {renderStep()}
                </DialogContent>
            </Dialog>
        </>
    );
}
