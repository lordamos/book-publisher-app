import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  callback: (event: KeyboardEvent) => void;
  description?: string;
  preventDefault?: boolean;
}

/**
 * Hook for managing keyboard shortcuts
 * Handles platform-specific modifiers (Cmd on Mac, Ctrl on Windows/Linux)
 * 
 * @param shortcuts Array of keyboard shortcuts to register
 * @param enabled Whether the shortcuts are enabled (default: true)
 * 
 * @example
 * useKeyboardShortcuts([
 *   {
 *     key: 'e',
 *     meta: true, // Cmd on Mac, Ctrl on Windows
 *     callback: () => handleExport(),
 *     description: 'Quick export'
 *   },
 *   {
 *     key: 'Escape',
 *     callback: () => handleClose(),
 *     description: 'Close dialog'
 *   }
 * ])
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled = true
) {
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    for (const shortcut of shortcutsRef.current) {
      const keyMatches =
        event.key.toLowerCase() === shortcut.key.toLowerCase() ||
        event.code.toLowerCase() === shortcut.key.toLowerCase();

      if (!keyMatches) continue;

      // Check modifier keys
      const ctrlKey = shortcut.ctrl ?? false;
      const shiftKey = shortcut.shift ?? false;
      const altKey = shortcut.alt ?? false;
      const metaKey = shortcut.meta ?? false;

      // On Mac, Cmd is meta; on Windows/Linux, Ctrl is ctrl
      const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const effectiveCtrl = isMac ? event.metaKey : event.ctrlKey;

      const ctrlMatches = ctrlKey === effectiveCtrl;
      const shiftMatches = shiftKey === event.shiftKey;
      const altMatches = altKey === event.altKey;
      const metaMatches = metaKey === event.metaKey;

      if (ctrlMatches && shiftMatches && altMatches && metaMatches) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.callback(event);
        break;
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}

/**
 * Hook for managing focus trap in dialogs
 * Keeps focus within the dialog when Tab is pressed
 * 
 * @param containerRef Reference to the dialog container
 * @param enabled Whether the focus trap is enabled (default: true)
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  enabled = true
) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, enabled]);
}

/**
 * Hook for managing dialog keyboard interactions
 * Combines common dialog patterns: Escape to close, Tab focus trap
 * 
 * @param onClose Callback when Escape is pressed
 * @param containerRef Reference to the dialog container
 * @param enabled Whether the interactions are enabled (default: true)
 */
export function useDialogKeyboardInteractions(
  onClose: () => void,
  containerRef: React.RefObject<HTMLElement>,
  enabled = true
) {
  useKeyboardShortcuts(
    [
      {
        key: 'Escape',
        callback: onClose,
        description: 'Close dialog',
      },
    ],
    enabled
  );

  useFocusTrap(containerRef, enabled);
}

/**
 * Helper function to format keyboard shortcut for display
 * 
 * @param shortcut The keyboard shortcut object
 * @returns Formatted string like "Cmd+E" or "Ctrl+Shift+S"
 */
export function formatKeyboardShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.meta) {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.ctrl) {
    parts.push('Ctrl');
  }
  if (shortcut.shift) {
    parts.push('Shift');
  }
  if (shortcut.alt) {
    parts.push('Alt');
  }

  // Format the key
  let keyDisplay = shortcut.key;
  if (shortcut.key.length === 1) {
    keyDisplay = shortcut.key.toUpperCase();
  } else if (shortcut.key === 'Escape') {
    keyDisplay = 'Esc';
  }

  parts.push(keyDisplay);
  return parts.join('+');
}

/**
 * Hook for displaying keyboard shortcut help
 * Returns a formatted string of all registered shortcuts
 * 
 * @param shortcuts Array of keyboard shortcuts
 * @returns Formatted help text
 */
export function useKeyboardShortcutHelp(shortcuts: KeyboardShortcut[]): string {
  return shortcuts
    .filter((s) => s.description)
    .map((s) => `${formatKeyboardShortcut(s)}: ${s.description}`)
    .join('\n');
}
