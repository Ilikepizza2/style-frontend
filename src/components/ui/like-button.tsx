"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAnimationPerformance, prefersReducedMotion } from "@/utils/animation-performance";

interface LikeButtonProps {
    className?: string;
    "aria-label"?: string;
    onLikeChange?: (isLiked: boolean) => void;
    initialLiked?: boolean;
}

interface LikeButtonState {
    isLiked: boolean;
    isAnimating: boolean;
    animationType: 'like' | 'unlike' | 'hover' | 'idle';
}

export function LikeButton({
    className = "",
    "aria-label": ariaLabel = "Like",
    onLikeChange,
    initialLiked = false
}: LikeButtonProps) {
    const [state, setState] = useState<LikeButtonState>({
        isLiked: initialLiked,
        isAnimating: false,
        animationType: 'idle'
    });

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const { registerAnimation, unregisterAnimation, isPerformanceGood } = useAnimationPerformance();
    const [reducedMotion, setReducedMotion] = useState(false);

    // Check for reduced motion preference
    useEffect(() => {
        setReducedMotion(prefersReducedMotion());

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleChange = () => setReducedMotion(mediaQuery.matches);

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const handleAnimationEnd = useCallback(() => {
        setState(prev => ({
            ...prev,
            isAnimating: false,
            animationType: 'idle'
        }));
        unregisterAnimation();
    }, [unregisterAnimation]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();

        // Debounce rapid clicks
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            const newLikedState = !state.isLiked;
            const animationType = newLikedState ? 'like' : 'unlike';

            // Check performance before starting animation
            const shouldAnimate = !reducedMotion && isPerformanceGood();

            setState(prev => ({
                ...prev,
                isLiked: newLikedState,
                isAnimating: shouldAnimate,
                animationType: shouldAnimate ? animationType : 'idle'
            }));

            if (shouldAnimate) {
                registerAnimation();

                // Clear any existing timeout
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                // Set timeout to end animation
                timeoutRef.current = setTimeout(handleAnimationEnd, animationType === 'like' ? 600 : 400);
            }

            // Notify parent component
            onLikeChange?.(newLikedState);
        }, 50);
    }, [state.isLiked, onLikeChange, handleAnimationEnd, reducedMotion, isPerformanceGood, registerAnimation]);

    // Generate CSS classes
    const buttonClasses = [
        "like-button",
        "group",
        "absolute",
        "right-2",
        "top-2",
        "flex",
        "h-7",
        "w-7",
        "items-center",
        "justify-center",
        state.isLiked && "is-liked",
        state.isAnimating && "is-animating",
        state.animationType === 'like' && "animate-like",
        state.animationType === 'unlike' && "animate-unlike",
        className
    ].filter(Boolean).join(" ");

    return (
        <button
            type="button"
            className={buttonClasses}
            onClick={handleClick}
            aria-label={`${ariaLabel} ${state.isLiked ? '(liked)' : '(not liked)'}`}
            aria-pressed={state.isLiked}
        >
            <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-red-500 transition-transform duration-300 group-[.is-liked]:scale-125"
                aria-hidden="true"
            >
                {/* Outline path */}
                <path
                    d="M16.5 3.5c-1.74 0-3.41 1.01-4.16 2.5-.75-1.49-2.42-2.5-4.16-2.5C5 3.5 3 5.5 3 8c0 3.78 3.4 6.86 8.55 11.53L12 20.35l.45-.42C17.6 14.86 21 11.78 21 8c0-2.5-2-4.5-4.5-4.5Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Filled path */}
                <path
                    d="M16.5 3.5c-1.74 0-3.41 1.01-4.16 2.5-.75-1.49-2.42-2.5-4.16-2.5C5 3.5 3 5.5 3 8c0 3.78 3.4 6.86 8.55 11.53L12 20.35l.45-.42C17.6 14.86 21 11.78 21 8c0-2.5-2-4.5-4.5-4.5Z"
                    className="fill-red-500 opacity-0 transition-opacity duration-300 group-[.is-liked]:opacity-100"
                />
            </svg>
        </button>
    );
}