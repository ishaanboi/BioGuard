"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth, db, storage } from "@/firebase/config";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, Loader2, User, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form States
    const [goals, setGoals] = useState("");
    const [notes, setNotes] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Data Fetch
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setGoals(data.goals || "");
                    setNotes(data.notes || "");
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Handle Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validate size (e.g., < 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be smaller than 2MB");
            return;
        }

        try {
            setUploading(true);
            const storageRef = ref(storage, `users/${user.uid}/profile_pic`);

            // Upload
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            // Update Auth Profile
            await updateProfile(user, { photoURL: url });

            // Force refresh (AuthContext might not catch deep detail update immediately without reload or complex handling)
            // But usually next render picks it up if we trigger it. 
            // We'll update a local key or just reload usage. 
            // For now, toast and let UI react if context updates.

            toast.success("Profile picture updated!");
            setTimeout(() => window.location.reload(), 1000); // Simple reload to ensure all headers/navs update
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to update profile picture");
        } finally {
            setUploading(false);
        }
    };

    // Handle Saving Data
    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, {
                goals,
                notes,
                email: user.email, // Ensure core data exists
                updatedAt: new Date().toISOString()
            }, { merge: true });
            toast.success("Health manifesto saved!");
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save data");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-400" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Left Column: Profile Card */}
                <div className="w-full md:w-1/3 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-lg flex flex-col items-center text-center">
                        <div className="relative group cursor-pointer mb-4" onClick={() => fileInputRef.current?.click()}>
                            <Avatar className="w-32 h-32 border-4 border-[#0f172a] shadow-xl">
                                <AvatarImage src={user?.photoURL || undefined} className="object-cover" />
                                <AvatarFallback className="bg-blue-600 text-3xl font-bold">
                                    {user?.displayName?.[0] || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white w-8 h-8" />
                            </div>
                            {uploading && (
                                <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                                    <Loader2 className="text-blue-400 w-8 h-8 animate-spin" />
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />

                        <h2 className="text-xl font-bold text-white">{user?.displayName || "User"}</h2>
                        <p className="text-blue-200/50 text-sm">{user?.email}</p>

                        <div className="mt-6 w-full pt-6 border-t border-white/10">
                            <p className="text-xs text-white/30 uppercase tracking-widest mb-2 font-mono">Status</p>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Active Member
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Health Manifesto */}
                <div className="w-full md:w-2/3 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-lg">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-blue-400" />
                                    Health Manifesto
                                </h1>
                                <p className="text-blue-200/50 text-sm">Set your intentions and track your journey.</p>
                            </div>
                            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-200/80 uppercase tracking-wider">My Goals </label>
                                <Textarea
                                    placeholder="E.g., Drink 3L of water daily, Walk 10k steps, Sleep 8 hours..."
                                    value={goals}
                                    onChange={(e) => setGoals(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white min-h-[120px] focus:border-blue-500/50 resize-y"
                                />
                                <p className="text-xs text-white/20">Aim for specific, measurable targets.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-200/80 uppercase tracking-wider">Personal Notes</label>
                                <Textarea
                                    placeholder="Track symptoms, questions for the doctor, or daily reflections..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white min-h-[200px] focus:border-blue-500/50 resize-y font-serif italic text-lg leading-relaxed text-white/80"
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
