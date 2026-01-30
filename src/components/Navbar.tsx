'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { LogOut, User, FileText, Home } from 'lucide-react';

export default function Navbar() {
    const { user } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/auth/login');
    };

    if (!user) return null;

    return (
        <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            SmartCare
                        </Link>
                        <div className="hidden md:block ml-10 flex items-baseline space-x-4">
                            <NavLink href="/dashboard" icon={<Home className="w-4 h-4" />}>Dashboard</NavLink>
                            <NavLink href="/documents" icon={<FileText className="w-4 h-4" />}>My Documents</NavLink>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                            <User className="w-4 h-4" />
                            <span>{user.displayName || user.email}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
        >
            {icon}
            {children}
        </Link>
    );
}
