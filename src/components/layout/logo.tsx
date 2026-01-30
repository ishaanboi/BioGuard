import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
    return (
        <Link href="/dashboard" className={cn("flex items-center gap-2", className)}>
            <BrainCircuit className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold text-white font-headline tracking-tight">
                BioGuard
            </span>
        </Link>
    );
}
