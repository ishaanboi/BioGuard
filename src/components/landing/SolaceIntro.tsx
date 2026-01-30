'use client';

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import ShinyText from '../ui/ShinyText';

interface SolaceIntroProps {
    onComplete?: () => void;
}

export default function SolaceIntro({ onComplete }: SolaceIntroProps) {
    const shouldReduceMotion = useReducedMotion();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Total animation time roughly 4-5s before exit
        // Title (1.5s) + Pause (0.5s) + Tagline (1.5s) + Hold (1.5s)
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 4500);

        return () => clearTimeout(timer);
    }, []);

    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.5 }
        },
        exit: {
            opacity: 0,
            transition: { duration: 1, ease: "easeInOut" }
        }
    };

    const titleVariants = {
        hidden: {
            opacity: 0,
            scale: 0.9,
            y: 20
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                // Reduced motion: gentle fade only
                opacity: { duration: shouldReduceMotion ? 0.8 : 1.5, ease: "easeOut" },
                scale: { duration: shouldReduceMotion ? 0 : 1.5, ease: [0.16, 1, 0.3, 1] }, // Strong easeOut
                y: { duration: shouldReduceMotion ? 0 : 1.5, ease: [0.16, 1, 0.3, 1] },
            } as any // Bypass strict variant typing for complex ease unions
        }
    };

    const taglineVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                opacity: { duration: 1.2, ease: "easeOut", delay: shouldReduceMotion ? 0.5 : 2.0 },
                y: { duration: shouldReduceMotion ? 0 : 1.2, ease: "easeOut", delay: 2.0 }
            } as any
        }
    };

    return (
        <AnimatePresence onExitComplete={onComplete}>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-900 text-purple-500"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                >
                    <div className="text-center px-4">
                        {/* Title Reveal */}
                        <motion.h1
                            className="text-5xl md:text-7xl font-bold tracking-tight mb-8 font-sans"
                            variants={titleVariants}
                        >
                            <ShinyText
                                text="BioGuard"
                                disabled={false}
                                speed={3}
                                color="#60a5fa"
                                shineColor="#eff6ff"
                                className="custom-class"
                            />
                        </motion.h1>

                        {/* Tagline Reveal */}
                        <motion.p
                            className="text-xl md:text-2xl text-purple-300/80 font-light tracking-wide"
                            variants={taglineVariants}
                        >
                            Your Health, Our Priority.
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
