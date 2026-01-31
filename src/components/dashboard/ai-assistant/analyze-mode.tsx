'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Loader2, AlertCircle, FileSearch, Pill, Stethoscope, FileDigit, BadgeCheck, CheckCircle2, Search, ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { analyzeMedicalDocument } from '@/app/actions/analyze-document';
import { cn } from '@/lib/utils';
import { storage, db } from "@/firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from 'sonner';

export function AnalyzeMode() {
    const { user } = useAuth();
    const [step, setStep] = useState<'category' | 'select_file' | 'upload' | 'processing' | 'result'>('category');
    const [category, setCategory] = useState('');
    const [existingDocs, setExistingDocs] = useState<any[]>([]);
    const [isLoadingDocs, setIsLoadingDocs] = useState(false);

    // Upload & Analysis State
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<any>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState(''); // Uploading... Analyzing... Saving...
    const fileInputRef = useRef<HTMLInputElement>(null);

    const categories = [
        { id: 'Lab Report', label: 'Lab Report', icon: FileDigit, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'hover:border-blue-500/50' },
        { id: 'Prescription', label: 'Prescription', icon: Pill, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'hover:border-emerald-500/50' },
        { id: 'Imaging', label: 'Imaging', icon: Stethoscope, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'hover:border-purple-500/50' },
        { id: 'Insurance', label: 'Insurance', icon: BadgeCheck, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'hover:border-amber-500/50' },
        { id: 'Other', label: 'Other', icon: FileText, color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'hover:border-gray-500/50' },
    ];

    const handleCategorySelect = async (catId: string) => {
        setCategory(catId);
        await fetchExistingDocuments(catId);
    };

    const fetchExistingDocuments = async (cat: string) => {
        if (!user) return;
        setIsLoadingDocs(true);
        try {
            const q = query(
                collection(db, 'documents'),
                where('userId', '==', user.uid),
                where('category', '==', cat),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setExistingDocs(docs);
            setStep('select_file');
        } catch (error) {
            console.error("Error fetching docs:", error);
            // Fallback to upload if fetch fails or no index (though minimal index needed)
            setStep('upload');
        } finally {
            setIsLoadingDocs(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            await processNewUpload(selectedFile);
        }
    };



    const processNewUpload = async (fileToProcess: File) => {
        if (!user) {
            toast.error("You must be logged in.");
            return;
        }

        setStep('processing');
        setStatus('Uploading to secure storage...');
        setProgress(0);

        try {
            // 1. Upload to Firebase Storage
            const storageRef = ref(storage, `documents/${user.uid}/${Date.now()}_${fileToProcess.name}`);
            const uploadTask = uploadBytesResumable(storageRef, fileToProcess);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(prog);
                },
                (error) => {
                    console.error(error);
                    setStatus('Upload failed.');
                    toast.error("Upload failed.");
                },
                async () => {
                    // 2. Upload Complete - Get URL
                    setStatus('Analyzing document content...');
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // 3. AI Analysis
                    let aiData = {
                        summary: "Analysis unavailable.",
                        category: category,
                        anomalies: []
                    };

                    try {
                        const analysisResult = await analyzeMedicalDocument(downloadURL, fileToProcess.type);
                        console.log("Client: Received Analysis Result:", analysisResult); // DEBUG LOG
                        aiData = {
                            summary: analysisResult.summary || "No summary generated.",
                            category: analysisResult.category || category,
                            anomalies: analysisResult.anomalies || []
                        };
                    } catch (aiError) {
                        console.error("AI Error:", aiError);
                        toast.warning("AI Analysis had a hiccup, saving file anyway.");
                    }

                    // 4. Save Metadata to Firestore
                    setStatus('Saving to your records...');

                    await addDoc(collection(db, "documents"), {
                        userId: user.uid,
                        name: fileToProcess.name.split('.')[0],
                        category: aiData.category,
                        fileUrl: downloadURL,
                        fileType: fileToProcess.type,
                        size: fileToProcess.size,
                        createdAt: serverTimestamp(),
                        recordDate: serverTimestamp(),
                        summary: aiData.summary,
                        anomalies: aiData.anomalies,
                        status: 'processed',
                        folderId: null
                    });

                    setResult(aiData);
                    setStep('result');
                    toast.success("Document analyzed!");
                }
            );

        } catch (error: any) {
            console.error("Process Error:", error);
            setStatus(`Error: ${error.message}`);
        }
    };

    const handleReanalyze = async () => {
        if (!result || !file) { // File might be null if viewing existing doc, handled below
            // logic for re-analyzing existing doc
        }
    };

    // New re-analyze function for existing docs (doc object from state)
    // We need to keep track of the current doc ID if we want to update it
    const [currentDocId, setCurrentDocId] = useState<string | null>(null);

    const handleExistingDocSelect = (doc: any) => {
        setCurrentDocId(doc.id);
        setResult({
            summary: doc.summary || "No summary available for this document.",
            anomalies: doc.anomalies || [],
            category: doc.category,
            fileUrl: doc.fileUrl, // Ensure we have the URL
            fileType: doc.fileType || 'application/pdf' // Default fallback
        });
        setStep('result');
    };

    const reanalyzeCurrentDoc = async () => {
        if (!result?.fileUrl || !user) return;

        setStatus('Re-analyzing document...');
        setStep('processing');
        setProgress(50); // Fake progress for re-analysis

        try {
            // Re-run analysis
            const analysisResult = await analyzeMedicalDocument(result.fileUrl, result.fileType);

            // Update Firestore
            if (currentDocId) {
                const docRef = await import("firebase/firestore").then(m => m.doc(db, "documents", currentDocId));
                const updateDoc = await import("firebase/firestore").then(m => m.updateDoc);

                await updateDoc(docRef, {
                    summary: analysisResult.summary,
                    anomalies: analysisResult.anomalies || [],
                    category: analysisResult.category || category
                });
            }

            setResult({
                ...result,
                summary: analysisResult.summary,
                anomalies: analysisResult.anomalies || [],
                category: analysisResult.category || category
            });
            setStep('result');
            toast.success("Document re-analyzed and updated!");

        } catch (error: any) {
            console.error("Re-analysis failed:", error);
            toast.error("Failed to re-analyze: " + error.message);
            setStep('result'); // Go back to result on failure
        }
    };

    // ... (rest of processNewUpload remains same)

    return (
        <div className="flex flex-col h-full p-4 space-y-4">
            {/* ... (Categories and Upload steps same) ... */}

            {/* Step 1: Category Selection */}
            {step === 'category' && (
                <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4">
                    <h3 className="text-xl font-bold text-white text-center mb-6">What type of document?</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategorySelect(cat.id)}
                                className={cn(
                                    "p-4 rounded-xl border border-white/10 bg-[#0f172a] hover:bg-white/5 transition-all text-center flex flex-col items-center gap-3 group",
                                    cat.border
                                )}
                            >
                                {isLoadingDocs && category === cat.id ? (
                                    <Loader2 className="w-12 h-12 text-blue-400 animate-spin p-2" />
                                ) : (
                                    <div className={cn("p-3 rounded-full transition-transform group-hover:scale-110", cat.bg)}>
                                        <cat.icon className={cn("w-6 h-6", cat.color)} />
                                    </div>
                                )}
                                <span className="font-medium text-white text-sm">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 1.5: Select Existing or Upload */}
            {step === 'select_file' && (
                <div className="flex-1 flex flex-col space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">{category}s found</h3>
                        <Button variant="ghost" size="sm" onClick={() => setStep('category')}>Back</Button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {existingDocs.length > 0 ? (
                            existingDocs.map((doc) => (
                                <button
                                    key={doc.id}
                                    onClick={() => handleExistingDocSelect(doc)}
                                    className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-white truncate max-w-[200px]">{doc.name}</p>
                                            <p className="text-xs text-blue-200/50 flex items-center gap-1 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {doc.createdAt?.seconds ? new Date(doc.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date'}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-8 text-blue-200/40">
                                <FileSearch className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No existing {category}s found.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-500 gap-2"
                            onClick={() => setStep('upload')}
                        >
                            <Upload className="w-4 h-4" />
                            Upload New {category}
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Upload New */}
            {step === 'upload' && (
                <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in-95">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-square max-w-[250px] border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-blue-500/50 transition-all group"
                    >
                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-blue-500/5">
                            <Upload className="w-10 h-10 text-blue-400" />
                        </div>
                        <p className="font-bold text-white text-lg">Upload {category}</p>
                        <p className="text-sm text-blue-200/50 mt-2">Tap to scan/upload</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*,application/pdf"
                            onChange={handleFileSelect}
                        />
                    </div>
                    <Button variant="ghost" onClick={() => setStep('select_file')} className="mt-8 text-blue-200/50 hover:text-white">
                        Back to List
                    </Button>
                </div>
            )}

            {/* Step 3: Processing */}
            {step === 'processing' && (
                <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                    <p className="text-white font-medium text-lg">{status}</p>
                    <div className="w-full max-w-[200px] h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Step 4: Result */}
            {step === 'result' && result && (
                <div className="flex-1 overflow-y-auto space-y-4 animate-in slide-in-from-bottom-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
                        <h4 className="text-emerald-300 font-bold mb-3 flex items-center gap-2 text-lg">
                            <CheckCircle2 className="w-5 h-5" /> Analysis Result
                        </h4>
                        <p className="text-emerald-100/90 leading-relaxed text-sm">{result.summary}</p>
                    </div>

                    {result.anomalies?.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                            <h4 className="text-red-300 font-bold mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Anomalies Detected
                            </h4>
                            <ul className="list-disc list-inside text-red-200/80 text-sm space-y-1">
                                {result.anomalies.map((a: string, i: number) => <li key={i}>{a}</li>)}
                            </ul>
                        </div>
                    )}

                    {file && (
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-sm text-blue-200/60 mb-1">Saved to Documents as:</p>
                            <p className="font-medium text-white">{category} / {file?.name}</p>
                        </div>
                    )}

                    {/* Re-analyze button for existing docs */}
                    {!file && currentDocId && (
                        <Button
                            variant="outline"
                            className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-500/10 hover:text-white"
                            onClick={reanalyzeCurrentDoc}
                        >
                            <Sparkles className="w-4 h-4 mr-2" /> Re-Analyze to Fix
                        </Button>
                    )}

                    <Button className="w-full bg-blue-600 hover:bg-blue-500 mt-2" onClick={() => { setFile(null); setResult(null); setStep('category'); setCurrentDocId(null); }}>
                        Check Another Document
                    </Button>
                </div>
            )}
        </div>
    );
}
