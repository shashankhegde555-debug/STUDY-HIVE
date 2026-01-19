import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

/**
 * RingProgress - Vibrant Gradient Ring for Light Mode
 */
const RingProgress = ({
    value = 0,
    size = 200,
    strokeWidth = 10
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const progress = useMotionValue(0);
    const strokeDashoffset = useTransform(
        progress,
        [0, 100],
        [circumference, 0]
    );

    useEffect(() => {
        const animation = animate(progress, value, {
            duration: 1.2,
            ease: "easeOut"
        });
        return animation.stop;
    }, [value]);

    const gradientId = `ring-gradient-light-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <svg
            width={size}
            height={size}
            className="transform -rotate-90"
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
            </defs>

            {/* Background Ring */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
            />

            {/* Progress Ring */}
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                style={{ strokeDashoffset }}
            />
        </svg>
    );
};

export default RingProgress;
