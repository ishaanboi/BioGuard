'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SolaceIntro from './SolaceIntro';

export default function ClientHomeWrapper({ children }: { children: React.ReactNode }) {
    // Start with content hidden
    const [showContent, setShowContent] = useState(false);

    return (
        <>
            <SolaceIntro onComplete={() => setShowContent(true)} />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showContent ? 1 : 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-full"
            >
                {children}
            </motion.div>
        </>
    );
}
