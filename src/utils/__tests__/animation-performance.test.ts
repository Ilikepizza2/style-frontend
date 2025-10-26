import { animationMonitor, debounce, prefersReducedMotion } from '../animation-performance';

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
    setTimeout(cb, 16);
    return 1;
});

global.cancelAnimationFrame = jest.fn();

// Mock performance.now
global.performance = {
    ...global.performance,
    now: jest.fn(() => Date.now()),
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

describe('AnimationPerformanceMonitor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        animationMonitor.stopMonitoring();
    });

    afterEach(() => {
        animationMonitor.stopMonitoring();
    });

    it('starts monitoring when animation is registered', () => {
        const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame');
        
        animationMonitor.registerAnimation();
        
        expect(requestAnimationFrameSpy).toHaveBeenCalled();
    });

    it('stops monitoring when all animations are unregistered', () => {
        const cancelAnimationFrameSpy = jest.spyOn(global, 'cancelAnimationFrame');
        
        animationMonitor.registerAnimation();
        animationMonitor.unregisterAnimation();
        
        expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    });

    it('tracks animation count correctly', () => {
        animationMonitor.registerAnimation();
        animationMonitor.registerAnimation();
        
        const metrics = animationMonitor.getMetrics();
        expect(metrics.animationCount).toBe(2);
        
        animationMonitor.unregisterAnimation();
        
        const updatedMetrics = animationMonitor.getMetrics();
        expect(updatedMetrics.animationCount).toBe(1);
    });

    it('prevents animation count from going below zero', () => {
        animationMonitor.unregisterAnimation();
        animationMonitor.unregisterAnimation();
        
        const metrics = animationMonitor.getMetrics();
        expect(metrics.animationCount).toBe(0);
    });

    it('returns performance metrics', () => {
        const metrics = animationMonitor.getMetrics();
        
        expect(metrics).toHaveProperty('frameRate');
        expect(metrics).toHaveProperty('animationCount');
        expect(metrics).toHaveProperty('lastFrameTime');
        expect(typeof metrics.frameRate).toBe('number');
        expect(typeof metrics.animationCount).toBe('number');
        expect(typeof metrics.lastFrameTime).toBe('number');
    });

    it('evaluates performance correctly', () => {
        // Mock good performance
        jest.spyOn(animationMonitor, 'getMetrics').mockReturnValue({
            frameRate: 60,
            animationCount: 1,
            lastFrameTime: Date.now(),
        });
        
        expect(animationMonitor.isPerformanceGood()).toBe(true);
        expect(animationMonitor.getPerformanceRecommendation()).toBe('good');
        
        // Mock poor performance
        jest.spyOn(animationMonitor, 'getMetrics').mockReturnValue({
            frameRate: 20,
            animationCount: 1,
            lastFrameTime: Date.now(),
        });
        
        expect(animationMonitor.isPerformanceGood()).toBe(false);
        expect(animationMonitor.getPerformanceRecommendation()).toBe('poor');
    });
});

describe('debounce', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('delays function execution', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 100);
        
        debouncedFn('test');
        expect(mockFn).not.toHaveBeenCalled();
        
        jest.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('cancels previous calls when called multiple times', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 100);
        
        debouncedFn('first');
        debouncedFn('second');
        debouncedFn('third');
        
        jest.advanceTimersByTime(100);
        
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('preserves function arguments', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 100);
        
        debouncedFn('arg1', 'arg2', 'arg3');
        jest.advanceTimersByTime(100);
        
        expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });
});

describe('prefersReducedMotion', () => {
    it('returns false when reduced motion is not preferred', () => {
        window.matchMedia = jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
        }));
        
        expect(prefersReducedMotion()).toBe(false);
    });

    it('returns true when reduced motion is preferred', () => {
        window.matchMedia = jest.fn().mockImplementation(query => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            media: query,
        }));
        
        expect(prefersReducedMotion()).toBe(true);
    });

    it('returns false in server environment', () => {
        const originalWindow = global.window;
        // @ts-ignore
        delete global.window;
        
        expect(prefersReducedMotion()).toBe(false);
        
        global.window = originalWindow;
    });
});