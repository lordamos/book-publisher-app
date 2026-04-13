import { useCallback, useEffect, useRef, useState } from 'react';
import { CommandHistory, Command } from '@/lib/commandHistory';

interface UseHistoryOptions {
  maxSize?: number;
  onUndoRedo?: (action: 'undo' | 'redo') => void;
}

/**
 * Hook for managing undo/redo history with keyboard shortcuts
 */
export function useHistory(options: UseHistoryOptions = {}) {
  const { maxSize = 100, onUndoRedo } = options;
  const historyRef = useRef<CommandHistory>(new CommandHistory(maxSize));
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [nextCommand, setNextCommand] = useState<string | null>(null);

  /**
   * Update UI state based on history
   */
  const updateState = useCallback(() => {
    const history = historyRef.current;
    setCanUndo(history.canUndo());
    setCanRedo(history.canRedo());
    setLastCommand(history.getLastCommandDescription());
    setNextCommand(history.getNextRedoDescription());
  }, []);

  /**
   * Execute a command and add to history
   */
  const execute = useCallback((command: Command) => {
    historyRef.current.execute(command);
    updateState();
  }, [updateState]);

  /**
   * Undo the last command
   */
  const undo = useCallback(() => {
    if (historyRef.current.undo()) {
      updateState();
      onUndoRedo?.('undo');
      return true;
    }
    return false;
  }, [updateState, onUndoRedo]);

  /**
   * Redo the next command
   */
  const redo = useCallback(() => {
    if (historyRef.current.redo()) {
      updateState();
      onUndoRedo?.('redo');
      return true;
    }
    return false;
  }, [updateState, onUndoRedo]);

  /**
   * Clear all history
   */
  const clear = useCallback(() => {
    historyRef.current.clear();
    updateState();
  }, [updateState]);

  /**
   * Setup keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      // Ctrl+Shift+Z or Ctrl+Y or Cmd+Shift+Z for redo
      else if (
        ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) ||
        ((event.ctrlKey || event.metaKey) && event.key === 'y')
      ) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    execute,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
    lastCommand,
    nextCommand,
    history: historyRef.current,
  };
}
