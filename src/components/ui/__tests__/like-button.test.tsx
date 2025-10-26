import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LikeButton } from '../like-button';

// Mock the animation performance utilities
jest.mock('@/utils/animation-performance', () => ({
    useAnimationPerformance: () => ({
        registerAnimation: jest.fn(),
        unregisterAnimation: jest.fn(),
        isPerformanceGood: () => true,
    }),
    prefersReducedMotion: () => false,
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

describe('LikeButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with default props', () => {
        render(<LikeButton />);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', 'Like (not liked)');
        expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('renders with custom aria-label', () => {
        render(<LikeButton aria-label="Like shirt" />);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Like shirt (not liked)');
    });

    it('toggles liked state when clicked', async () => {
        const onLikeChange = jest.fn();
        render(<LikeButton onLikeChange={onLikeChange} />);

        const button = screen.getByRole('button');

        // Click to like
        fireEvent.click(button);

        await waitFor(() => {
            expect(onLikeChange).toHaveBeenCalledWith(true);
        });

        // Click to unlike
        fireEvent.click(button);

        await waitFor(() => {
            expect(onLikeChange).toHaveBeenCalledWith(false);
        });
    });

    it('applies correct CSS classes for animation states', async () => {
        render(<LikeButton />);
        const button = screen.getByRole('button');

        // Initial state
        expect(button).toHaveClass('like-button');
        expect(button).not.toHaveClass('is-liked');
        expect(button).not.toHaveClass('is-animating');

        // Click to trigger animation
        fireEvent.click(button);

        await waitFor(() => {
            expect(button).toHaveClass('is-liked');
            expect(button).toHaveClass('is-animating');
            expect(button).toHaveClass('animate-like');
        });
    });

    it('updates aria-pressed attribute correctly', async () => {
        render(<LikeButton />);
        const button = screen.getByRole('button');

        expect(button).toHaveAttribute('aria-pressed', 'false');

        fireEvent.click(button);

        await waitFor(() => {
            expect(button).toHaveAttribute('aria-pressed', 'true');
        });
    });

    it('updates aria-label to reflect state', async () => {
        render(<LikeButton aria-label="Like item" />);
        const button = screen.getByRole('button');

        expect(button).toHaveAttribute('aria-label', 'Like item (not liked)');

        fireEvent.click(button);

        await waitFor(() => {
            expect(button).toHaveAttribute('aria-label', 'Like item (liked)');
        });
    });

    it('starts with initialLiked state', () => {
        render(<LikeButton initialLiked={true} />);
        const button = screen.getByRole('button');

        expect(button).toHaveClass('is-liked');
        expect(button).toHaveAttribute('aria-pressed', 'true');
        expect(button).toHaveAttribute('aria-label', 'Like (liked)');
    });

    it('applies custom className', () => {
        render(<LikeButton className="custom-class" />);
        const button = screen.getByRole('button');

        expect(button).toHaveClass('custom-class');
        expect(button).toHaveClass('like-button');
    });

    it('debounces rapid clicks', async () => {
        const onLikeChange = jest.fn();
        render(<LikeButton onLikeChange={onLikeChange} />);

        const button = screen.getByRole('button');

        // Rapid clicks
        fireEvent.click(button);
        fireEvent.click(button);
        fireEvent.click(button);

        // Should only register the last click after debounce
        await waitFor(() => {
            expect(onLikeChange).toHaveBeenCalledTimes(1);
        });
    });

    it('contains SVG heart icon', () => {
        render(<LikeButton />);
        const svg = screen.getByRole('button').querySelector('svg');

        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
        expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('prevents default on click event', () => {
        render(<LikeButton />);
        const button = screen.getByRole('button');

        const clickEvent = new MouseEvent('click', { bubbles: true });
        const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

        fireEvent(button, clickEvent);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });
});