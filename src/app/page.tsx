import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import Link from "next/link";
import ClientHomeWrapper from "@/components/landing/ClientHomeWrapper";
import ShiftBackground from "@/components/landing/shift-background";

export default function Home() {
    return (
        <ShiftBackground className="flex flex-col">
            <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <BrainCircuit className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold text-white drop-shadow-md">BioGuard</span>
                </Link>
                <nav className="flex items-center gap-4">
                    <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10" asChild>
                        <Link href="/auth/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/auth/signup">Get Started</Link>
                    </Button>
                </nav>
            </header>

            <main className="flex-grow">
                <ClientHomeWrapper>

                    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col items-center text-center">
                        <div className="max-w-3xl space-y-8">
                            <h1 className="text-5xl md:text-7xl font-bold font-quote tracking-tight leading-tight text-white drop-shadow-lg">
                                Advanced Biometric Protection.
                            </h1>
                            <p className="text-xl md:text-2xl text-blue-100/80 leading-relaxed max-w-2xl mx-auto font-medium">
                                BioGuard utilizes state-of-the-art AI to monitor vital signs and detect anomalies, ensuring your health is always in safe hands.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Button size="lg" variant="premium" className="h-12 px-8 text-lg" asChild>
                                    <Link href="/auth/signup">Get Protected</Link>
                                </Button>
                                <Button size="lg" variant="ghost" className="h-12 px-8 text-lg rounded-full" asChild>
                                    <Link href="/auth/login">Log In</Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    <section className="py-20 md:py-24">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <Card className="max-w-3xl mx-auto bg-card/50 border-input">
                                <CardHeader>
                                    <CardTitle className="text-3xl font-headline italic text-blue-100/90">"Wherever the art of Medicine is loved, there is also a love of Humanity."</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-blue-200/60 mt-4 font-semibold">
                                        — Hippocrates
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </ClientHomeWrapper>
            </main>

            <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground text-sm">
                © {new Date().getFullYear()} BioGuard. All rights reserved.
            </footer>
        </ShiftBackground>
    );
}
