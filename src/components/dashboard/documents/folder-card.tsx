"use client";

import { useState } from "react";
import { MoreVertical, Trash2, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AnimatedFolder } from "@/components/ui/animated-folder";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { db } from "@/firebase/config";
import { deleteDoc, doc } from "firebase/firestore";
import { toast } from "sonner";
import { MrfaModal } from "./mrfa-modal";

interface FolderCardProps {
    folder: any;
    onOpen: (folder: any) => void;
}

export function FolderCard({ folder, onOpen }: FolderCardProps) {
    const [isMrfaOpen, setIsMrfaOpen] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Delete folder "${folder.name}"? Documents inside will be hidden.`)) {
            try {
                await deleteDoc(doc(db, "folders", folder.id));
                toast.success("Folder deleted");
            } catch (error) {
                toast.error("Failed to delete folder");
            }
        }
    };

    return (
        <>
            <div
                onClick={() => onOpen(folder)}
                className="group relative bg-[#1e293b]/50 border border-white/5 hover:border-trombone/50 hover:bg-trombone/5 rounded-xl p-4 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 aspect-square sm:aspect-[4/3]"
            >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0f172a] border-white/10 text-white">
                            <DropdownMenuItem
                                className="hover:bg-blue-500/10 cursor-pointer text-blue-200 focus:text-blue-100 focus:bg-blue-500/20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMrfaOpen(true);
                                }}
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Create MRFA Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer" onClick={handleDelete}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="mb-2 transition-transform group-hover:scale-105 pointer-events-auto">
                    <AnimatedFolder color="#D2B55B" size={0.8} />
                </div>

                <div className="text-center w-full px-2">
                    <h3 className="font-semibold text-white truncate text-sm sm:text-base" title={folder.name}>
                        {folder.name}
                    </h3>
                    <p className="text-xs text-blue-200/40 mt-1">
                        {folder.recordDate ? folder.recordDate.toDate().toLocaleDateString() : (folder.createdAt ? formatDistanceToNow(folder.createdAt.toDate(), { addSuffix: true }) : 'Just now')}
                    </p>
                </div>
            </div>

            <MrfaModal
                isOpen={isMrfaOpen}
                onClose={() => setIsMrfaOpen(false)}
                folder={folder}
            />
        </>
    );
}

