"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderPlus, Calendar } from "lucide-react";
import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateFolderModal({ isOpen, onClose }: CreateFolderModalProps) {
    const { user } = useAuth();
    const [folderName, setFolderName] = useState("");
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!folderName.trim() || !user) return;

        setLoading(true);
        try {
            await addDoc(collection(db, "folders"), {
                userId: user.uid,
                name: folderName.trim(),
                createdAt: serverTimestamp(),
                recordDate: date ? Timestamp.fromDate(new Date(date)) : serverTimestamp(), // Use selected date or now
                docCount: 0
            });
            toast.success(`Folder "${folderName}" created`);
            setFolderName("");
            setDate("");
            onClose();
        } catch (error) {
            console.error("Error creating folder:", error);
            toast.error("Failed to create folder");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#0f172a] border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderPlus className="w-5 h-5 text-blue-400" />
                        New Folder
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Input
                        placeholder="Folder Name (e.g., Surgery 2024)"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white focus:border-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        autoFocus
                    />
                    <div className="space-y-2">
                        <label className="text-xs text-blue-200/50 uppercase font-bold tracking-wider">Date (Optional)</label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-white/5 border-white/10 text-white focus:border-blue-500 [color-scheme:dark]"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} className="hover:bg-white/5 text-white/70">Cancel</Button>
                    <Button onClick={handleCreate} disabled={loading || !folderName.trim()} className="bg-blue-600 hover:bg-blue-500">
                        {loading ? "Creating..." : "Create Folder"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
