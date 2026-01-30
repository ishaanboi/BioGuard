'use client';

import { useCallback, useState } from 'react';
// import { useDropzone } from 'react-dropzone'; // Removed unused import
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/context/AuthContext';
import { Upload, X, CheckCircle, File as FileIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadArea() {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Simple Native Drag & Drop Implementation to avoid extra dependency for now
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files[0]);
        }
    };

    const handleFiles = async (file: File) => {
        if (!user) return;
        setUploading(true);
        setStatus('idle');
        setProgress(0);

        const storage = getStorage();
        const storageRef = ref(storage, `users/${user.uid}/documents/${Date.now()}_${file.name}`);

        // Metadata for security rules and easy filtering
        const metadata = {
            contentType: file.type,
            customMetadata: {
                originalName: file.name,
                uploadedBy: user.uid
            }
        };

        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        uploadTask.on('state_changed',
            (snapshot) => {
                const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(p);
            },
            (error) => {
                console.error(error);
                setStatus('error');
                setUploading(false);
            },
            () => {
                setStatus('success');
                setUploading(false);
                setTimeout(() => setStatus('idle'), 3000);
                // Trigger generic refresh or callback here
            }
        );
    };

    return (
        <div className="w-full">
            <div
                className={`relative glass-panel border-2 border-dashed rounded-xl p-10 transition-all ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/20'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleChange}
                    accept=".pdf,.png,.jpg,.jpeg,.docx"
                />

                <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-white/5 rounded-full mb-4">
                        <Upload className={`w-8 h-8 ${dragActive ? 'text-blue-400' : 'text-gray-400'}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Upload Medical Records</h3>
                    <p className="text-gray-400 text-sm mb-4">Drag & drop or click to upload X-rays, Reports (PDF)</p>
                    <p className="text-xs text-gray-500">Max file size: 10MB</p>
                </div>

                {/* Progress Overlay */}
                <AnimatePresence>
                    {(uploading || status === 'success') && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 glass-panel flex flex-col items-center justify-center z-20"
                        >
                            {status === 'success' ? (
                                <>
                                    <CheckCircle className="w-10 h-10 text-green-400 mb-2" />
                                    <span className="text-green-400 font-medium">Upload Complete</span>
                                </>
                            ) : (
                                <>
                                    <FileIcon className="w-8 h-8 text-blue-400 mb-4 animate-bounce" />
                                    <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-blue-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <span className="mt-2 text-sm text-gray-400">{Math.round(progress)}%</span>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
