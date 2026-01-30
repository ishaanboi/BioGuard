'use client';

import { cn } from '@/lib/utils';
import React, { useEffect, useState, useRef } from 'react';

interface ShootingStar {
    id: number;
    x: number;
    y: number;
    angle: number;
    scale: number;
    speed: number;
    distance: number;
}

interface ShootingStarsProps {
    minSpeed?: number;
    maxSpeed?: number;
    minDelay?: number;
    maxDelay?: number;
    starColor?: string;
    trailColor?: string;
    starWidth?: number;
    starHeight?: number;
    className?: string;
}

// Helper to create random props for a star
const getRandomStartPoint = (width: number, height: number) => {
    const side = Math.floor(Math.random() * 4);
    const offset = Math.random() * Math.max(width, height);

    switch (side) {
        case 0: return { x: offset, y: -50, angle: 45 }; // Top
        case 1: return { x: width + 50, y: offset, angle: 135 }; // Right
        case 2: return { x: offset, y: height + 50, angle: 225 }; // Bottom
        case 3: return { x: -50, y: offset, angle: 315 }; // Left
        default: return { x: 0, y: 0, angle: 45 };
    }
};

export const ShootingStars = ({
    minSpeed = 10,
    maxSpeed = 30,
    minDelay = 500, // Reduced from typical 1200 for higher frequency
    maxDelay = 1500, // Reduced from typical 4200 for higher frequency
    starColor = '#9E00FF',
    trailColor = '#2EB9DF',
    starWidth = 10,
    starHeight = 1,
    className,
}: ShootingStarsProps) => {
    const [star, setStar] = useState<ShootingStar | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const createStar = () => {
            if (!svgRef.current) return;
            const { width, height } = svgRef.current.getBoundingClientRect();
            const { x, y, angle } = getRandomStartPoint(width, height);

            const newStar: ShootingStar = {
                id: Date.now(),
                x,
                y,
                angle,
                scale: 1,
                speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
                distance: 0,
            };
            setStar(newStar);

            const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
            setTimeout(createStar, randomDelay);
        };

        createStar();
    }, [minSpeed, maxSpeed, minDelay, maxDelay]);

    useEffect(() => {
        if (!star) return;

        const moveStar = () => {
            setStar((prevStar) => {
                if (!prevStar) return null;
                const newX = prevStar.x + prevStar.speed * Math.cos((prevStar.angle * Math.PI) / 180);
                const newY = prevStar.y + prevStar.speed * Math.sin((prevStar.angle * Math.PI) / 180);
                const newDistance = prevStar.distance + prevStar.speed;
                const newScale = 1 + newDistance / 100;

                if (newX < -50 || newX > window.innerWidth + 50 || newY < -50 || newY > window.innerHeight + 50) {
                    return null;
                }

                return {
                    ...prevStar,
                    x: newX,
                    y: newY,
                    distance: newDistance,
                    scale: newScale,
                };
            });
        };

        const animationFrame = requestAnimationFrame(moveStar);
        return () => cancelAnimationFrame(animationFrame);
    }, [star]);

    if (!star) return null;

    return (
        <svg
            ref={svgRef}
            className={cn('w-full h-full absolute inset-0 z-0 pointer-events-none', className)}
        >
            <rect
                key={star.id}
                x={star.x}
                y={star.y}
                width={starWidth * star.scale}
                height={starHeight}
                fill="url(#gradient)"
                transform={`rotate(${star.angle}, ${star.x + (starWidth * star.scale) / 2}, ${star.y + starHeight / 2})`}
            />
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
                    <stop offset="100%" style={{ stopColor: starColor, stopOpacity: 1 }} />
                </linearGradient>
            </defs>
        </svg>
    );
};
