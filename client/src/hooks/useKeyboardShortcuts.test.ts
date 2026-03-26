import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useKeyboardShortcuts,
  useFocusTrap,
  useDialogKeyboardInteractions,
  formatKeyboardShortcut,
  KeyboardShortcut,
} from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should register and trigger keyboard shortcuts', () => {
    const callback = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'e',
        meta: true,
        callback,
        description: 'Quick export',
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts, true));

    const event = new KeyboardEvent('keydown', {
      key: 'e',
      metaKey: true,
      bubbles: true,
    });

    window.dispatchEvent(event);
    expect(callback).toHaveBeenCalled();
  });

  it('should handle Escape key', () => {
    const callback = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'Escape',
        callback,
        description: 'Close',
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts, true));

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });

    window.dispatchEvent(event);
    expect(callback).toHaveBeenCalled();
  });

  it('should handle Shift modifier', () => {
    const callback = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 's',
        shift: true,
        callback,
        description: 'Save',
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts, true));

    const event = new KeyboardEvent('keydown', {
      key: 's',
      shiftKey: true,
      bubbles: true,
    });

    window.dispatchEvent(event);
    expect(callback).toHaveBeenCalled();
  });

  it('should handle Alt modifier', () => {
    const callback = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'a',
        alt: true,
        callback,
        description: 'Alt+A',
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts, true));

    const event = new KeyboardEvent('keydown', {
      key: 'a',
      altKey: true,
      bubbles: true,
    });

    window.dispatchEvent(event);
    expect(callback).toHaveBeenCalled();
  });

  it('should not trigger shortcuts when disabled', () => {
    const callback = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'e',
        meta: true,
        callback,
        description: 'Quick export',
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts, false));

    const event = new KeyboardEvent('keydown', {
      key: 'e',
      metaKey: true,
      bubbles: true,
    });

    window.dispatchEvent(event);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should prevent default behavior when preventDefault is not false', () => {
    const callback = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'e',
        meta: true,
        callback,
        preventDefault: true,
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts, true));

    const event = new KeyboardEvent('keydown', {
      key: 'e',
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should handle multiple shortcuts', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'e',
        meta: true,
        callback: callback1,
      },
      {
        key: 'Escape',
        callback: callback2,
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts, true));

    const event1 = new KeyboardEvent('keydown', {
      key: 'e',
      metaKey: true,
      bubbles: true,
    });

    const event2 = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });

    window.dispatchEvent(event1);
    window.dispatchEvent(event2);

    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it('should be case-insensitive for key matching', () => {
    const callback = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'e',
        meta: true,
        callback,
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts, true));

    const event = new KeyboardEvent('keydown', {
      key: 'E',
      metaKey: true,
      bubbles: true,
    });

    window.dispatchEvent(event);
    expect(callback).toHaveBeenCalled();
  });
});

describe('formatKeyboardShortcut', () => {
  it('should format meta+key shortcut', () => {
    const shortcut: KeyboardShortcut = {
      key: 'e',
      meta: true,
      callback: () => {},
    };

    const formatted = formatKeyboardShortcut(shortcut);
    expect(formatted).toMatch(/⌘\+E|Ctrl\+E/);
  });

  it('should format Escape key', () => {
    const shortcut: KeyboardShortcut = {
      key: 'Escape',
      callback: () => {},
    };

    const formatted = formatKeyboardShortcut(shortcut);
    expect(formatted).toBe('Esc');
  });

  it('should format Shift+key shortcut', () => {
    const shortcut: KeyboardShortcut = {
      key: 's',
      shift: true,
      callback: () => {},
    };

    const formatted = formatKeyboardShortcut(shortcut);
    expect(formatted).toBe('Shift+S');
  });

  it('should format Alt+key shortcut', () => {
    const shortcut: KeyboardShortcut = {
      key: 'a',
      alt: true,
      callback: () => {},
    };

    const formatted = formatKeyboardShortcut(shortcut);
    expect(formatted).toBe('Alt+A');
  });

  it('should format multiple modifiers', () => {
    const shortcut: KeyboardShortcut = {
      key: 's',
      ctrl: true,
      shift: true,
      callback: () => {},
    };

    const formatted = formatKeyboardShortcut(shortcut);
    expect(formatted).toBe('Ctrl+Shift+S');
  });
});

describe('useDialogKeyboardInteractions', () => {
  it('should close dialog on Escape', () => {
    const onClose = vi.fn();
    const ref = { current: document.createElement('div') };

    renderHook(() =>
      useDialogKeyboardInteractions(onClose, ref as React.RefObject<HTMLElement>, true)
    );

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });

    window.dispatchEvent(event);
    expect(onClose).toHaveBeenCalled();
  });

  it('should not close dialog when disabled', () => {
    const onClose = vi.fn();
    const ref = { current: document.createElement('div') };

    renderHook(() =>
      useDialogKeyboardInteractions(onClose, ref as React.RefObject<HTMLElement>, false)
    );

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });

    window.dispatchEvent(event);
    expect(onClose).not.toHaveBeenCalled();
  });
});
