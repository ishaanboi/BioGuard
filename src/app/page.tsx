import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import Link from "next/link";
import ClientHomeWrapper from "@/components/landing/ClientHomeWrapper";
import ShiftBackground from "@/components/landing/shift-background";

export default function Home() {
    return (
        <ShiftBackground className="flex flex-col min-h-screen overflow-hidden text-white font-sans relative">
            <header className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <BrainCircuit className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold text-white drop-shadow-md">BioGuard</span>
                </Link>
                <nav className="flex items-center gap-4">
                    <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10" asChild>
                        <Link href="/auth/login">Login</Link>
                    </Button>
                    <Button className="bg-white text-black hover:bg-slate-200 rounded-xl px-6 h-10 font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)]" asChild>
                        <Link href="/auth/signup">Get Started</Link>
                    </Button>
                </nav>
            </header>

            <main className="relative z-10 flex-grow flex flex-col items-center pt-20">
                <ClientHomeWrapper>
                    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center text-center gap-6 max-w-5xl">

                        {/* Top Pill - Animated */}
                        <div className="animate-slide-up delay-100 mb-4 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                            <span className="mr-2">✨</span>
                            State of the art Protection
                        </div>

                        <h1 className="animate-slide-up delay-300 text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter leading-[1.05] text-white drop-shadow-lg">
                            Your health, <br className="hidden md:block" />
                            <span className="text-gradient-pro">Our Priority</span>
                        </h1>
                        <p className="animate-slide-up delay-500 text-lg md:text-xl text-slate-400 max-w-2xl font-medium tracking-tight mt-2">
                            BioGuard utilizes state-of-the-art AI to monitor vital signs and detect anomalies, ensuring your health is always in safe hands.
                        </p>

                        <div className="animate-slide-up delay-700 flex flex-col sm:flex-row gap-4 justify-center pt-8">
                            <Button size="lg" className="bg-white text-black hover:bg-slate-200 rounded-xl px-8 h-12 text-base font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] border-0" asChild>
                                <Link href="/auth/signup">Get Protected <span className="ml-2 font-normal text-slate-500">&gt;</span></Link>
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-xl px-8 h-12 text-base font-semibold border-white/10 hover:bg-white/5 transition-all bg-transparent text-white" asChild>
                                <Link href="/auth/login">Log In <span className="ml-2 font-normal opacity-50">&gt;</span></Link>
                            </Button>
                        </div>
                    </section>

                    <section className="py-20 md:py-32 w-full animate-slide-up delay-700 relative z-20">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                            {/* Subtle glow behind the card */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-32 bg-primary/20 blur-[100px] pointer-events-none rounded-full" />

                            <Card className="max-w-3xl mx-auto bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl relative z-10 transition-transform duration-500 hover:scale-[1.02]">
                                <CardHeader>
                                    <CardTitle className="text-3xl md:text-4xl font-quote italic text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 font-normal leading-snug">
                                        "Wherever the art of Medicine is loved, there is also a love of Humanity."
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-center gap-4 mt-6">
                                        <div className="h-[1px] w-12 bg-white/20"></div>
                                        <p className="text-slate-400 font-semibold tracking-widest uppercase text-sm">
                                            Hippocrates
                                        </p>
                                        <div className="h-[1px] w-12 bg-white/20"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </ClientHomeWrapper>
            </main>

            <footer className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-500 text-sm border-t border-white/5">
                © {new Date().getFullYear()} BioGuard. All rights reserved.
            </footer>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#080c17] to-transparent z-10 pointer-events-none" />
        </ShiftBackground>
    );
}
