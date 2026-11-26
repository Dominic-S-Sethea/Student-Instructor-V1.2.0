import React, { useRef, useState, useEffect, useCallback } from 'react';
import { isSelectableTextTarget } from '../utils/textSelectionGuard';

export function useDraggableScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    checkScrollability();
    el.addEventListener('scroll', checkScrollability, { passive: true });
    window.addEventListener('resize', checkScrollability);

    // Initial delay check for content rendering
    const timer = setTimeout(checkScrollability, 150);

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [checkScrollability]);

  const onMouseDown = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    // Never hijack text selection or interactive controls; only drag from empty scroll track space.
    if (isSelectableTextTarget(e.target)) return;

    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = ref.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeftState - walk;
    checkScrollability();
  };

  const scrollLeft = () => {
    ref.current?.scrollBy({ left: -220, behavior: 'smooth' });
  };

  const scrollRight = () => {
    ref.current?.scrollBy({ left: 220, behavior: 'smooth' });
  };

  return {
    ref,
    isDragging,
    canScrollLeft,
    canScrollRight,
    events: {
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      onMouseMove,
    },
    scrollLeft,
    scrollRight,
    checkScrollability,
  };
}
