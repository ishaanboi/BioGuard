"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { storage, db, auth } from "@/firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { analyzeMedicalDocument } from "@/app/actions/analyze-document";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete?: () => void;
    currentFolderId?: string;
}

export function UploadModal({ isOpen, onClose, onUploadComplete, currentFolderId }: UploadModalProps) {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [docName, setDocName] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStep, setUploadStep] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setFile(null);
        setDocName("");
        setCategory("");
        setDate("");
        setUploadProgress(0);
        setUploadStep('idle');
        setIsUploading(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setDocName(selectedFile.name.split('.')[0]); // Auto-fill name
        }
    };

    const handleUpload = async () => {
        if (!file || !docName || !category || !user) {
            toast.error("Please fill in all fields.");
            return;
        }

        setIsUploading(true);
        setUploadStep('uploading');

        // Create storage reference
        const storageRef = ref(storage, `documents/${user.uid}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Firebase Storage Error:", error.code, error.message, error);
                if (error.code === 'storage/unauthorized') {
                    toast.error("Permission denied. check Cloud Storage rules.");
                } else if (error.code === 'storage/canceled') {
                    toast.error("Upload canceled.");
                } else {
                    toast.error(`Upload failed: ${error.message}`);
                }
                setIsUploading(false);
                setUploadStep('idle');
            },
            async () => {
                // Upload complete
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                // Simulate AI Analysis
                setUploadStep('analyzing');
                setTimeout(async () => {
                    await saveDocumentMetadata(downloadURL);
                }, 2000); // Mock 2s analyzing time
            }
        );
    };

    const saveDocumentMetadata = async (url: string) => {
        try {
            // Real AI Analysis
            let aiData = {
                summary: "AI Analysis pending...",
                category: category || "Other",
                anomalies: []
            };

            try {
                if (file) {
                    const result = await analyzeMedicalDocument(url, file.type);
                    aiData = {
                        summary: result.summary,
                        category: result.category || category,
                        anomalies: result.anomalies || []
                    };
                    // Auto-update category if user left it generic, or trust AI more?
                    // Let's stick to user choice if set, or suggest? 
                    // For now, we'll keep user choice as primary but save AI summary.
                }
            } catch (aiError) {
                console.error("AI Analysis Failed, falling back to basic save", aiError);
                toast.error("AI Analysis failed. Saving without insights.");
            }

            await addDoc(collection(db, "documents"), {
                userId: user?.uid,
                name: docName,
                category: category,
                fileUrl: url,
                fileType: file?.type,
                size: file?.size,
                createdAt: serverTimestamp(),
                recordDate: date ? Timestamp.fromDate(new Date(date)) : serverTimestamp(),
                summary: aiData.summary,
                anomalies: aiData.anomalies,
                status: 'processed',
                folderId: currentFolderId || null
            });

            setUploadStep('complete');
            toast.success("Document analyzed and saved!");
            setTimeout(() => {
                if (onUploadComplete) onUploadComplete();
                onClose();
                resetForm();
            }, 1000);
        } catch (error: any) {
            console.error("Firestore Error:", error);
            if (error.code === 'permission-denied') {
                toast.error("Database permission denied. Check Firestore rules.");
            } else {
                toast.error(`Database Error: ${error.message}`);
            }
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open && !isUploading) {
                onClose();
                resetForm();
            }
        }}>
            <DialogContent className="bg-[#0f172a] border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-headline font-bold">Upload Medical Record</DialogTitle>
                    <DialogDescription className="text-blue-200/60">
                        Upload your reports for AI analysis and secure storage.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* File Drop Area */}
                    {!file ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
                                <Upload className="w-6 h-6 text-blue-400" />
                            </div>
                            <p className="text-sm font-medium text-white">Click to upload file</p>
                            <p className="text-xs text-blue-200/50 mt-1">PDF, JPG, PNG up to 10MB</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileSelect}
                            />
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-white truncate max-w-[180px]">{file.name}</p>
                                    <p className="text-xs text-blue-200/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            {!isUploading && (
                                <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="h-8 w-8 text-blue-200/50 hover:text-white hover:bg-white/10">
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Metadata Inputs */}
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-blue-200/70">Document Name</label>
                            <Input
                                placeholder="e.g., Annual Physical Report"
                                className="bg-white/5 border-white/10 text-white focus:border-blue-500/50"
                                value={docName}
                                onChange={(e) => setDocName(e.target.value)}
                                disabled={isUploading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-blue-200/70">Category</label>
                                <Select onValueChange={setCategory} disabled={isUploading} value={category}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-blue-500/50">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                                        <SelectItem value="Lab Report">Lab Report</SelectItem>
                                        <SelectItem value="Prescription">Prescription</SelectItem>
                                        <SelectItem value="Imaging">Imaging</SelectItem>
                                        <SelectItem value="Insurance">Insurance</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-blue-200/70">Date (Optional)</label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white focus:border-blue-500/50 [color-scheme:dark]"
                                    disabled={isUploading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Progress State */}
                    {isUploading && (
                        <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-xs text-blue-200/70">
                                <span>
                                    {uploadStep === 'uploading' && "Uploading..."}
                                    {uploadStep === 'analyzing' && "AI Analyzing Content..."}
                                    {uploadStep === 'complete' && "Complete!"}
                                </span>
                                <span>{Math.round(uploadProgress)}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-1.5" />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isUploading} className="text-blue-200 hover:text-white hover:bg-white/5 transition-colors">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || !docName || !category || isUploading}
                        className="bg-blue-600 hover:bg-blue-500 text-white transition-colors min-w-[100px]"
                    >
                        {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Analyze & Save"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
