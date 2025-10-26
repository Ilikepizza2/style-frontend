/**
 * Animation performance monitoring utilities
 */

interface PerformanceMetrics {
    frameRate: number;
    animationCount: number;
    lastFrameTime: number;
}

class AnimationPerformanceMonitor {
    private metrics: PerformanceMetrics = {
        frameRate: 60,
        animationCount: 0,
        lastFrameTime: performance.now()
    };

    private frameCount = 0;
    private lastFpsUpdate = performance.now();
    private animationFrame: number | null = null;
    private isMonitoring = false;

    /**
     * Start monitoring animation performance
     */
    startMonitoring(): void {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.monitorFrame();
    }

    /**
     * Stop monitoring animation performance
     */
    stopMonitoring(): void {
        this.isMonitoring = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /**
     * Register a new animation start
     */
    registerAnimation(): void {
        this.metrics.animationCount++;

        // Start monitoring if not already active
        if (!this.isMonitoring) {
            this.startMonitoring();
        }
    }

    /**
     * Register an animation end
     */
    unregisterAnimation(): void {
        this.metrics.animationCount = Math.max(0, this.metrics.animationCount - 1);

        // Stop monitoring if no active animations
        if (this.metrics.animationCount === 0) {
            this.stopMonitoring();
        }
    }

    /**
     * Get current performance metrics
     */
    getMetrics(): PerformanceMetrics {
        return { ...this.metrics };
    }

    /**
     * Check if performance is acceptable
     */
    isPerformanceGood(): boolean {
        return this.metrics.frameRate >= 55; // Allow some tolerance below 60fps
    }

    /**
     * Get performance recommendation
     */
    getPerformanceRecommendation(): 'good' | 'warning' | 'poor' {
        if (this.metrics.frameRate >= 55) return 'good';
        if (this.metrics.frameRate >= 30) return 'warning';
        return 'poor';
    }

    private monitorFrame = (): void => {
        if (!this.isMonitoring) return;

        const now = performance.now();
        this.frameCount++;

        // Update FPS every second
        if (now - this.lastFpsUpdate >= 1000) {
            this.metrics.frameRate = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }

        this.metrics.lastFrameTime = now;
        this.animationFrame = requestAnimationFrame(this.monitorFrame);
    };
}

// Global instance
export const animationMonitor = new AnimationPerformanceMonitor();

/**
 * Hook for components to register/unregister animations
 */
export function useAnimationPerformance() {
    return {
        registerAnimation: () => animationMonitor.registerAnimation(),
        unregisterAnimation: () => animationMonitor.unregisterAnimation(),
        getMetrics: () => animationMonitor.getMetrics(),
        isPerformanceGood: () => animationMonitor.isPerformanceGood(),
        getRecommendation: () => animationMonitor.getPerformanceRecommendation()
    };
}

/**
 * Debounce utility for preventing rapid function calls
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}