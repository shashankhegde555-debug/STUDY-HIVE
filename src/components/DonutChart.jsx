import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * DonutChart - Light Mode Interactive Donut Chart
 */

const COLORS = [
    { name: 'Pink', color: '#ec4899' },
    { name: 'Violet', color: '#8b5cf6' },
    { name: 'Cyan', color: '#06b6d4' },
    { name: 'Emerald', color: '#10b981' },
    { name: 'Amber', color: '#f59e0b' },
    { name: 'Rose', color: '#f43f5e' },
];

const DonutChart = ({
    data = [],
    size = 180,
    strokeWidth = 24
}) => {
    const [hovered, setHovered] = useState(null);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const total = data.reduce((sum, item) => sum + item.value, 0);

    let cumulativePercent = 0;
    const segments = data.map((item, index) => {
        const percent = total > 0 ? (item.value / total) * 100 : 0;
        const dashArray = (percent / 100) * circumference;
        const dashOffset = -(cumulativePercent / 100) * circumference;
        cumulativePercent += percent;

        return {
            ...item,
            percent,
            dashArray,
            dashOffset,
            color: COLORS[index % COLORS.length]
        };
    });

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background Ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                />

                {/* Segments */}
                {segments.map((segment, index) => (
                    <motion.circle
                        key={segment.name}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={segment.color.color}
                        strokeWidth={hovered === index ? strokeWidth + 4 : strokeWidth}
                        strokeLinecap="butt"
                        strokeDasharray={`${segment.dashArray} ${circumference}`}
                        strokeDashoffset={segment.dashOffset}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        onMouseEnter={() => setHovered(index)}
                        onMouseLeave={() => setHovered(null)}
                        className="cursor-pointer transition-all duration-200"
                    />
                ))}
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {hovered !== null ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                    >
                        <span className="text-2xl font-bold text-gray-800">{segments[hovered]?.hours || 0}h</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">{segments[hovered]?.name}</span>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-gray-800">{total}</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Tasks</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonutChart;
