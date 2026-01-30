'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStorage, ref, listAll, getMetadata, getDownloadURL, deleteObject, StorageReference } from 'firebase/storage';
import { useAuth } from '@/context/AuthContext';

export interface SmartDoc {
    name: string;
    fullPath: string;
    url: string;
    size: number;
    contentType: string;
    timeCreated: string;
    customMetadata?: {
        originalName?: string;
    };
}

export function useDocuments() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<SmartDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDocuments = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            const storage = getStorage();
            const listRef = ref(storage, `users/${user.uid}/documents`);
            const res = await listAll(listRef);

            const docPromises = res.items.map(async (itemRef) => {
                const metadata = await getMetadata(itemRef);
                const url = await getDownloadURL(itemRef);

                return {
                    name: metadata.customMetadata?.originalName || itemRef.name,
                    fullPath: itemRef.fullPath,
                    url,
                    size: metadata.size,
                    contentType: metadata.contentType || 'application/octet-stream',
                    timeCreated: metadata.timeCreated,
                    customMetadata: metadata.customMetadata,
                } as SmartDoc;
            });

            const docs = await Promise.all(docPromises);
            // Sort by newest first
            setDocuments(docs.sort((a, b) => new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime()));
        } catch (err: any) {
            console.error("Error fetching docs:", err);
            // Don't show error if it's just empty
            if (err.code === 'storage/object-not-found') {
                setDocuments([]);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    const deleteDocument = async (fullPath: string) => {
        try {
            const storage = getStorage();
            const docRef = ref(storage, fullPath);
            await deleteObject(docRef);
            setDocuments((prev) => prev.filter((d) => d.fullPath !== fullPath));
        } catch (err: any) {
            console.error("Delete error:", err);
            throw err;
        }
    };

    useEffect(() => {
        if (user) {
            fetchDocuments();
        }
    }, [user, fetchDocuments]);

    return { documents, loading, error, refresh: fetchDocuments, deleteDocument };
}
