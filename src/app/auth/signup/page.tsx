'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { Loader2, Github, Mail } from 'lucide-react';
import { SplitAuthLayout } from '@/components/auth/split-auth-layout';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to login with Google');
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {
                displayName: name
            });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SplitAuthLayout
            quote="Knowing yourself is the beginning of all wisdom."
            author="Aristotle"
        >
            <div className="space-y-8">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-headline font-black text-white mb-2 tracking-tight">Register</h1>
                    <p className="text-blue-200/60 font-medium">Start your journey to health security today.</p>
                </div>

                <div className="space-y-6">
                    {/* Social Buttons */}
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full h-12 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl transition-all"
                        >
                            <Mail className="mr-2 h-5 w-5" />
                            Continue with Google
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest">
                            <span className="bg-[#0f172a] px-4 text-blue-200/40 font-bold">Or continue with email</span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-white/80 font-bold ml-1 text-sm uppercase tracking-wide">Name</label>
                            <input
                                type="text"
                                required
                                className="w-full h-12 bg-white/5 border border-white/10 text-white placeholder:text-white/20 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-white/80 font-bold ml-1 text-sm uppercase tracking-wide">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full h-12 bg-white/5 border border-white/10 text-white placeholder:text-white/20 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-white/80 font-bold ml-1 text-sm uppercase tracking-wide">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full h-12 bg-white/5 border border-white/10 text-white placeholder:text-white/20 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90 text-white font-black text-lg rounded-xl shadow-lg shadow-blue-500/20 mt-4 transition-all tracking-[0.05em] flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'SIGN UP NOW'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-blue-200/60 font-medium">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                        Log in
                    </Link>
                </p>
            </div>
        </SplitAuthLayout>
    );
}
