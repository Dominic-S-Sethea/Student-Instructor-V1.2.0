const TEXT_SELECTABLE_TAGS = new Set([
  'P',
  'SPAN',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'TD',
  'TH',
  'LI',
  'A',
  'LABEL',
  'STRONG',
  'EM',
  'CODE',
  'PRE',
  'BUTTON',
  'INPUT',
  'TEXTAREA',
  'SELECT',
]);

/**
 * Returns true when the user currently has a non-empty text selection active.
 * Use in clickable card `onClick` handlers so drag-selecting text never triggers navigation/modals.
 */
export function hasActiveTextSelection(): boolean {
  if (typeof window === 'undefined' || typeof window.getSelection !== 'function') {
    return false;
  }
  const selection = window.getSelection();
  return Boolean(selection && selection.toString().trim().length > 0);
}

/**
 * Returns true when a mousedown target is text-bearing or interactive, so custom
 * drag-to-scroll containers yield to native browser text selection.
 */
export function isSelectableTextTarget(target: EventTarget | null): boolean {
  if (!target || typeof Node === 'undefined') {
    return false;
  }
  if (target instanceof Node && target.nodeType === Node.TEXT_NODE) {
    return true;
  }
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (TEXT_SELECTABLE_TAGS.has(target.tagName)) {
    return true;
  }
  for (let i = 0; i < target.childNodes.length; i += 1) {
    const child = target.childNodes[i];
    if (child.nodeType === Node.TEXT_NODE && (child.textContent ?? '').trim().length > 0) {
      return true;
    }
  }
  return false;
}
