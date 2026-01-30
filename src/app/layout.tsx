import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'SmartCare | Secure Health Vault',
    description: 'Your medical data, secure and accessible.',
};

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
            <body className="font-sans antialiased">
                <AuthProvider>
                    {children}
                    <Toaster />
                </AuthProvider>
            </body>
        </html>
    );
}
