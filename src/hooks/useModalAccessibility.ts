import { useEffect, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
  );
}

function resolveDialogContainer(containerRef?: RefObject<HTMLElement | null>): HTMLElement | null {
  if (containerRef?.current) return containerRef.current;
  if (typeof document === 'undefined') return null;
  const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]');
  return dialogs.length > 0 ? dialogs[dialogs.length - 1] : null;
}

/**
 * Full WCAG 2.1 dialog keyboard & focus management:
 * - Moves initial focus into the dialog container when opened
 * - Traps Tab / Shift+Tab within the dialog
 * - Closes on Escape
 * - Optionally locks body scroll and restores focus to the trigger element on close
 */
export function useAccessibleDialog(
  isOpen: boolean,
  onClose: () => void,
  containerRef?: RefObject<HTMLElement | null>,
  options: { lockScroll?: boolean } = {}
): void {
  const { lockScroll = true } = options;

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = lockScroll ? document.body.style.overflow : '';

    if (lockScroll) {
      document.body.style.overflow = 'hidden';
    }

    const focusTimer = window.requestAnimationFrame(() => {
      const container = resolveDialogContainer(containerRef);
      if (!container) return;
      if (container.contains(document.activeElement)) return;
      const focusable = getFocusableElements(container);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1');
        container.focus();
      }
    });

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const container = resolveDialogContainer(containerRef);
      if (!container) return;
      const focusable = getFocusableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !container.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      if (lockScroll) {
        document.body.style.overflow = previousOverflow;
      }
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose, containerRef, lockScroll]);
}

/**
 * Registers WCAG dialog accessibility (Escape-to-close + focus trap + focus restore)
 * for modals declaring role="dialog" and aria-modal="true".
 */
export function useEscapeKey(isOpen: boolean, onClose: () => void): void {
  useAccessibleDialog(isOpen, onClose, undefined, { lockScroll: false });
}
