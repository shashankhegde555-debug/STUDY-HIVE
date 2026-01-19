import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * TiltCard - Premium Light Glassmorphism Card
 * 
 * Features:
 * - Frosted glass effect with white/translucent background
 * - Soft diffused shadows
 * - Subtle hover elevation
 */
const TiltCard = ({
    children,
    className = '',
    tiltEnabled = false,
    onClick
}) => {
    const ref = useRef(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["2deg", "-2deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-2deg", "2deg"]);

    const handleMouseMove = (e) => {
        if (!ref.current || !tiltEnabled) return;

        const rect = ref.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        x.set(mouseX / rect.width - 0.5);
        y.set(mouseY / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: tiltEnabled ? rotateX : 0,
                rotateY: tiltEnabled ? rotateY : 0,
                transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={{
                y: -4,
                boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255,255,255,0.8) inset",
                transition: { duration: 0.25, ease: "easeOut" }
            }}
            className={`
                h-full w-full 
                bg-white/80 backdrop-blur-xl
                border border-white/60
                rounded-3xl p-6
                shadow-glass
                relative
                ${className}
            `}
        >
            {children}
        </motion.div>
    );
};

export default TiltCard;
