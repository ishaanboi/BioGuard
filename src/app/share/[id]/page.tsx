'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/firebase/config';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Loader2, Download, FileArchive, AlertTriangle, Clock } from 'lucide-react';
import { formatDistance, isPast } from 'date-fns';
import Link from 'next/link';

export default function SharePage() {
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [bundle, setBundle] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;

        const fetchBundle = async () => {
            try {
                const docRef = doc(db, 'mrfa_shares', id);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    setError("This link is invalid or has been deleted.");
                    return;
                }

                const data = docSnap.data();

                // Check Expiry
                const expiresAt = data.expiresAt instanceof Timestamp ? data.expiresAt.toDate() : new Date(data.expiresAt);
                if (isPast(expiresAt)) {
                    setError("This link has expired.");
                    return;
                }

                setBundle({ ...data, expiresAt });
            } catch (err) {
                console.error(err);
                setError("Failed to load medical records.");
            } finally {
                setLoading(false);
            }
        };

        fetchBundle();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#131E3A] flex flex-col items-center justify-center text-white">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-blue-200/60 animate-pulse">Requesting secure access...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#131E3A] flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#1e293b]/50 border border-white/5 p-8 rounded-2xl text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-400">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Access Denied</h1>
                    <p className="text-blue-200/60">{error}</p>
                    <Link href="/" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300">
                        Return to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#131E3A] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6 text-center">
                    <div className="space-y-2">
                        <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-white/10">
                            <FileArchive className="w-10 h-10 text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-headline font-black text-white">Medical Records</h1>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-blue-200/60 text-sm">
                            <span>Folder:</span>
                            <span className="text-white font-semibold">{bundle.folderName}</span>
                        </div>
                    </div>

                    <div className="bg-[#0f172a]/50 p-4 rounded-xl text-left border border-white/5 space-y-3">
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-yellow-500/80 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-white">Temporary Access</p>
                                <p className="text-xs text-blue-200/50 mt-0.5">
                                    Expires in {formatDistance(bundle.expiresAt, new Date())}
                                </p>
                            </div>
                        </div>
                    </div>

                    <a
                        href={bundle.downloadUrl}
                        download
                        className="flex items-center justify-center w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] group"
                    >
                        <Download className="w-5 h-5 mr-3 group-hover:translate-y-0.5 transition-transform" />
                        Download Secure Bundle
                    </a>

                    <p className="text-xs text-blue-200/30 pt-4 border-t border-white/5">
                        Provided securely by BioGuard
                    </p>
                </div>
            </div>
        </div>
    );
}
