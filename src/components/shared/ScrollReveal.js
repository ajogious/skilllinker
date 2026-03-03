"use client";

import { useEffect, useRef } from "react";

/**
 * ScrollReveal — wraps children and animates them when they scroll into view.
 * Props:
 *   - animation: "fade-up" | "fade-left" | "fade-right" | "zoom-in" (default: "fade-up")
 *   - delay: CSS transition-delay string (default: "0ms")
 *   - className: extra wrapper classes
 */
export default function ScrollReveal({
    children,
    animation = "fade-up",
    delay = "0ms",
    className = "",
}) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Add the pre-animation (hidden) class
        el.classList.add(`sr-${animation}`);
        el.style.transitionDelay = delay;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add("sr-visible");
                    observer.unobserve(el);
                }
            },
            { threshold: 0.12 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [animation, delay]);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}
