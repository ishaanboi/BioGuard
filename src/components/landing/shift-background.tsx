"use client";

import React, { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

interface ShiftBackgroundProps {
    className?: string;
    children?: React.ReactNode;
}

export default function ShiftBackground({
    className = "",
    children,
}: ShiftBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const noise3D = createNoise3D();
        let animationFrameId: number;

        // Configuration
        const circleCount = 15;
        const baseRadius = 200;
        const speed = 0.002; // Speed of time evolution
        const colorSpeed = 0.005; // Speed of color evolution

        // State
        let time = 0;
        let width = 0;
        let height = 0;

        interface Circle {
            x: number;
            y: number;
            radius: number;
            colorOffset: number;
            vx: number;
            vy: number;
        }

        const circles: Circle[] = [];

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            // Re-initialize circles on resize to spread them out
            circles.length = 0;
            for (let i = 0; i < circleCount; i++) {
                circles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: baseRadius + Math.random() * 100,
                    colorOffset: Math.random() * 1000,
                    vx: 0,
                    vy: 0,
                });
            }
        };

        const draw = () => {
            // Clear with very slight transparency for trail effect? No, full clear for this style.
            // Actually, standard clear is better for the "Shift" sharp->blur style.
            ctx.fillStyle = "#000000"; // Dark background
            ctx.fillRect(0, 0, width, height);

            time += speed;

            circles.forEach((circle, i) => {
                // Update position using noise
                // Noise inputs: spatial (normalized) + time
                // We want them to wander around.
                // Let's use noise to determine velocity vector angle or direct position offset?
                // "Shift" usually implies noise field flowing.

                // Simpler approach: Noise driven motion
                const nX = noise3D(circle.x * 0.001, circle.y * 0.001, time);
                const nY = noise3D(circle.x * 0.001 + 1000, circle.y * 0.001 + 1000, time);

                // Update coordinates gently
                circle.x += nX * 2;
                circle.y += nY * 2;

                // Wrap around screen
                if (circle.x < -circle.radius) circle.x = width + circle.radius;
                if (circle.x > width + circle.radius) circle.x = -circle.radius;
                if (circle.y < -circle.radius) circle.y = height + circle.radius;
                if (circle.y > height + circle.radius) circle.y = -circle.radius;

                // Color noise
                const rColor = noise3D(i * 10, 0, time * colorSpeed) * 0.5 + 0.5; // 0-1
                const gColor = noise3D(i * 10, 100, time * colorSpeed) * 0.5 + 0.5; // 0-1
                const bColor = noise3D(i * 10, 200, time * colorSpeed) * 0.5 + 0.5; // 0-1

                // Blue / Royal Blue palette
                // Theme Primary: #1d4ed8 (Blue 700 approx)
                // Range: 200 (Light Blue) to 240 (Royal Blue)

                const hue = 200 + rColor * 40;
                const saturation = 70 + gColor * 30; // 70-100%
                const lightness = 35 + bColor * 25; // 35-60%

                ctx.beginPath();
                ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);

                // ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                // Use a glowing gradient for the circle
                const gradient = ctx.createRadialGradient(
                    circle.x, circle.y, 0,
                    circle.x, circle.y, circle.radius
                );
                gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`);
                gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`);

                ctx.fillStyle = gradient;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener("resize", resize);
        resize();
        draw();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className={`relative min-h-screen w-full ${className}`}>
            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full pointer-events-none z-0"
                style={{ filter: "blur(60px)" }}
            />
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
