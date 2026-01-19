import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

/**
 * CustomCursor - Pure Edition
 * Features:
 * - Extremely minimal
 * - No background glow
 * - Precise interaction ring
 */
const CustomCursor = () => {
    // Mouse values
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const [cursorState, setCursorState] = useState('default');
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        const checkTouch = () => setIsTouch(window.matchMedia('(pointer: coarse)').matches);
        checkTouch();
        window.addEventListener('resize', checkTouch);

        const move = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const hover = (e) => {
            const target = e.target;
            const tag = target.tagName.toLowerCase();
            const isClickable =
                tag === 'button' ||
                tag === 'a' ||
                target.closest('button') ||
                target.closest('a') ||
                window.getComputedStyle(target).cursor === 'pointer';

            setCursorState(isClickable ? 'hover' : 'default');
        };

        const down = () => setCursorState('click');
        const up = () => setCursorState(s => s === 'click' ? 'hover' : 'default');

        if (!isTouch) {
            window.addEventListener('mousemove', move);
            window.addEventListener('mouseover', hover);
            window.addEventListener('mousedown', down);
            window.addEventListener('mouseup', up);
        }

        return () => {
            window.removeEventListener('resize', checkTouch);
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseover', hover);
            window.removeEventListener('mousedown', down);
            window.removeEventListener('mouseup', up);
        };
    }, [isTouch, mouseX, mouseY]);

    if (isTouch) return null;

    return (
        <>
            <style>{`
                body, button, a { cursor: none; }
                input, textarea { cursor: text; }
            `}</style>

            {/* The Precision Ring */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border border-white/50 mix-blend-exclusion"
                animate={{
                    width: cursorState === 'hover' ? 40 : 20,
                    height: cursorState === 'hover' ? 40 : 20,
                    opacity: cursorState === 'hover' ? 1 : 0.5,
                    scale: cursorState === 'click' ? 0.8 : 1
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{
                    x: springX,
                    y: springY,
                    translateX: "-50%",
                    translateY: "-50%"
                }}
            />

            {/* The Center Dot (Always present for precision) */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-white mix-blend-exclusion"
                animate={{
                    scale: cursorState === 'hover' ? 0 : 1 // Hide dot on hover for clear view
                }}
                style={{
                    width: 4,
                    height: 4,
                    x: mouseX,
                    y: mouseY,
                    translateX: "-50%",
                    translateY: "-50%"
                }}
            />
        </>
    );
};

export default CustomCursor;
