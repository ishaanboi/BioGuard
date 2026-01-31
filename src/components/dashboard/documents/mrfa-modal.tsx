'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Link as LinkIcon, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { createMRFALink } from '@/lib/mrfa-service';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { toast } from 'sonner';

interface MrfaModalProps {
    isOpen: boolean;
    onClose: () => void;
    folder: any;
}

export function MrfaModal({ isOpen, onClose, folder }: MrfaModalProps) {
    const [step, setStep] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [shareLink, setShareLink] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleCreateLink = async () => {
        if (!folder) return;
        setStep('processing');
        setErrorMsg('');

        try {
            // 1. Get documents for this folder
            // Note: We need to query documents matching this folderId
            const q = query(
                collection(db, 'documents'),
                where('folderId', '==', folder.id)
            );
            const querySnapshot = await getDocs(q);
            const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (documents.length === 0) {
                throw new Error("This folder is empty. Cannot create a link.");
            }

            // 2. Generate Link
            const linkId = await createMRFALink(folder, documents);
            const generatedUrl = `${window.location.origin}/share/${linkId}`;

            setShareLink(generatedUrl);
            setStep('success');
            toast.success("MRFA Link Ready!");

        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "Failed to create link.");
            setStep('error');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        toast.success("Link copied to clipboard");
    };

    const handleClose = () => {
        // Reset state on close if we are done or error
        if (step === 'success' || step === 'error') {
            setTimeout(() => {
                setStep('idle');
                setShareLink('');
                setErrorMsg('');
            }, 300);
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-[#1e293b] border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <LinkIcon className="w-5 h-5 text-blue-400" />
                        Medical Records Fast Access
                    </DialogTitle>
                    <DialogDescription className="text-blue-200/60">
                        Create a secure, temporary link to share all files in <span className="text-white font-bold">"{folder?.name}"</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    {step === 'idle' && (
                        <div className="text-center space-y-4">
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm">
                                ⚠️ This link will expire in 24 hours. Anyone with the link can download these records.
                            </div>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center space-y-4 py-4">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                            <p className="text-blue-200/80 animate-pulse">Packaging documents...</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center text-center space-y-2 mb-4">
                                <CheckCircle className="w-12 h-12 text-green-400" />
                                <h3 className="text-lg font-bold text-white">Link Generated!</h3>
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-[#0f172a] rounded-lg border border-white/10">
                                <input
                                    readOnly
                                    value={shareLink}
                                    className="bg-transparent border-none focus:ring-0 text-blue-300 text-sm w-full truncate px-2"
                                />
                                <Button size="sm" onClick={copyToClipboard} className="bg-blue-600 hover:bg-blue-500 shrink-0">
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-center text-xs text-blue-200/40">
                                Expires in 24 hours.
                            </p>
                        </div>
                    )}

                    {step === 'error' && (
                        <div className="flex flex-col items-center text-center space-y-2 text-red-400">
                            <AlertCircle className="w-10 h-10" />
                            <p>{errorMsg}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 'idle' && (
                        <div className="flex w-full gap-2">
                            <Button variant="ghost" onClick={handleClose} className="flex-1 hover:bg-white/5">Cancel</Button>
                            <Button onClick={handleCreateLink} className="flex-1 bg-blue-600 hover:bg-blue-500">
                                Generate Link
                            </Button>
                        </div>
                    )}
                    {(step === 'success' || step === 'error') && (
                        <Button onClick={handleClose} className="w-full bg-white/5 hover:bg-white/10">
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
