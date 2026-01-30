"use client";

import { useState, useEffect } from "react";
import { Plus, Search, File as FileIcon, Trash2, ExternalLink, Bot, ArrowLeft, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadModal } from "@/components/dashboard/documents/upload-modal";
import { CreateFolderModal } from "@/components/dashboard/documents/create-folder-modal";
import { FolderCard } from "@/components/dashboard/documents/folder-card";
import { db } from "@/firebase/config";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function DocumentsPage() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<any[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

    // Folder Navigation State
    const [currentFolder, setCurrentFolder] = useState<any | null>(null); // null = root

    // Fetch Folders
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "folders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snap) => {
            setFolders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    // Fetch Documents & Filter
    useEffect(() => {
        if (!user) return;
        setLoading(true);

        // Fetch All Documents (simplifies indexing for small hackathon datasets)
        // If dataset grows large, filtering should happen at query level with composite indexes
        const q = query(
            collection(db, "documents"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side Filter Logic
            if (currentFolder) {
                // Inside Folder: Show docs that match this folderId
                docs = docs.filter((d: any) => d.folderId === currentFolder.id);
            } else {
                // Root: Show docs with NO folderId (or null)
                docs = docs.filter((d: any) => !d.folderId);
            }

            setDocuments(docs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching docs:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, currentFolder]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this document?")) {
            try {
                await deleteDoc(doc(db, "documents", id));
                toast.success("Document deleted");
            } catch (error) {
                toast.error("Failed to delete document");
            }
        }
    };

    const filteredDocs = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredFolders = folders.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-headline font-bold text-white flex items-center gap-2">
                        {currentFolder ? (
                            <>
                                <ArrowLeft
                                    className="w-6 h-6 mr-2 cursor-pointer hover:text-blue-400 transition-colors"
                                    onClick={() => setCurrentFolder(null)}
                                />
                                <span className="text-blue-200/50 font-normal">{currentFolder.name}</span>
                            </>
                        ) : (
                            "My Documents"
                        )}
                    </h1>
                    <p className="text-blue-200/60 mt-1">
                        {currentFolder ? "Manage files in this folder." : "Manage your medical records."}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {!currentFolder && (
                        <Button
                            className="bg-white/5 border border-white/10 hover:bg-white/10"
                            onClick={() => setIsCreateFolderOpen(true)}
                        >
                            <FolderPlus className="w-4 h-4 mr-2" />
                            New Folder
                        </Button>
                    )}
                    <Button onClick={() => setIsUploadOpen(true)} className="bg-blue-600 hover:bg-blue-500">
                        <Plus className="w-4 h-4 mr-2" />
                        {currentFolder ? "Upload Here" : "New Document"}
                    </Button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200/40" />
                <Input
                    placeholder="Search documents or folders..."
                    className="pl-10 bg-[#0f172a]/50 border-white/10 text-white placeholder:text-blue-200/30 w-full md:max-w-md focus:border-blue-500/50 transition-all font-mono text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center py-20 text-blue-200/40 animate-pulse">Loading...</div>
            ) : (
                <div className="space-y-8">
                    {/* Folders (Only visible at Root) */}
                    {!currentFolder && (
                        filteredFolders.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {filteredFolders.map(folder => (
                                    <FolderCard
                                        key={folder.id}
                                        folder={folder}
                                        onOpen={setCurrentFolder}
                                    />
                                ))}
                            </div>
                        ) : null
                    )}

                    {/* Documents */}
                    {filteredDocs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredDocs.map((doc) => (
                                <Card key={doc.id} className="bg-[#1e293b]/50 border-white/5 hover:border-blue-500/30 transition-all group overflow-hidden">
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <FileIcon className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => window.open(doc.fileUrl, '_blank')} className="p-2 hover:bg-white/10 rounded-lg text-blue-300 transition-colors" title="View">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(doc.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-white truncate text-base mb-1" title={doc.name}>{doc.name}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-300 border-none text-[10px] uppercase tracking-wider">
                                                    {doc.category}
                                                </Badge>
                                                <span className="text-xs text-blue-200/40 font-mono py-1">
                                                    {doc.recordDate ? new Date(doc.recordDate.seconds * 1000).toLocaleDateString() : (doc.createdAt?.seconds ? new Date(doc.createdAt.seconds * 1000).toLocaleDateString() : 'Just now')}
                                                </span>
                                            </div>
                                        </div>

                                        {doc.summary && (
                                            <div className="bg-[#0f172a]/50 rounded-lg p-3 border border-white/5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Bot className="w-3 h-3 text-purple-400" />
                                                    <span className="text-[10px] uppercase font-bold text-purple-200/60 tracking-wider">AI Summary</span>
                                                </div>
                                                <p className="text-sm text-blue-200/70 line-clamp-2 leading-relaxed">
                                                    {doc.summary}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        documents.length === 0 && (
                            <div className="text-center py-20 rounded-2xl border border-dashed border-white/10 bg-white/5">
                                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileIcon className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {currentFolder ? "Folder is Empty" : "No Unfiled Documents"}
                                </h3>
                                <p className="text-blue-200/40 mb-6 max-w-sm mx-auto">
                                    {currentFolder ? "Upload documents directly to this folder." : "Create a folder or upload a new document to get started."}
                                </p>
                                <Button onClick={() => setIsUploadOpen(true)} className="bg-blue-600 hover:bg-blue-500">
                                    <Plus className="w-4 h-4 mr-2" />
                                    {currentFolder ? "Upload to Folder" : "New Document"}
                                </Button>
                            </div>
                        )
                    )}
                </div>
            )}

            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                currentFolderId={currentFolder?.id}
            />
            <CreateFolderModal
                isOpen={isCreateFolderOpen}
                onClose={() => setIsCreateFolderOpen(false)}
            />
        </div>
    );
}
