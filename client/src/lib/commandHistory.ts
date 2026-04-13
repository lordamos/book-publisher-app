/**
 * Command History System for Undo/Redo functionality
 * Tracks all operations and allows reverting/reapplying changes
 */

export interface Command {
  id: string;
  type: 'page' | 'text' | 'image' | 'formatting';
  action: 'create' | 'update' | 'delete' | 'reorder' | 'edit' | 'resize' | 'move';
  description: string;
  timestamp: number;
  execute: () => void;
  undo: () => void;
  redo?: () => void;
  metadata?: Record<string, any>;
}

export class CommandHistory {
  private history: Command[] = [];
  private currentIndex: number = -1;
  private maxSize: number = 100;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Execute a command and add it to history
   */
  execute(command: Command): void {
    // Remove any commands after current index (when new command is executed after undo)
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Execute the command
    command.execute();

    // Add to history
    this.history.push(command);
    this.currentIndex++;

    // Trim history if it exceeds max size
    if (this.history.length > this.maxSize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Undo the last command
   */
  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    const command = this.history[this.currentIndex];
    command.undo();
    this.currentIndex--;
    return true;
  }

  /**
   * Redo the next command
   */
  redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }

    this.currentIndex++;
    const command = this.history[this.currentIndex];
    command.redo ? command.redo() : command.execute();
    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get the last command description
   */
  getLastCommandDescription(): string | null {
    if (this.currentIndex >= 0) {
      return this.history[this.currentIndex].description;
    }
    return null;
  }

  /**
   * Get the next redo command description
   */
  getNextRedoDescription(): string | null {
    if (this.canRedo()) {
      return this.history[this.currentIndex + 1].description;
    }
    return null;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get history size
   */
  getSize(): number {
    return this.history.length;
  }

  /**
   * Get current position in history
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }
}

/**
 * Create a page operation command
 */
export function createPageCommand(
  type: 'create' | 'delete' | 'duplicate' | 'reorder',
  description: string,
  execute: () => void,
  undo: () => void,
  metadata?: Record<string, any>
): Command {
  return {
    id: `page-${type}-${Date.now()}`,
    type: 'page',
    action: type === 'reorder' ? 'reorder' : type === 'duplicate' ? 'create' : type,
    description,
    timestamp: Date.now(),
    execute,
    undo,
    metadata,
  };
}

/**
 * Create a text edit command
 */
export function createTextCommand(
  description: string,
  oldContent: string,
  newContent: string,
  execute: () => void,
  undo: () => void
): Command {
  return {
    id: `text-${Date.now()}`,
    type: 'text',
    action: 'edit',
    description,
    timestamp: Date.now(),
    execute,
    undo,
    redo: execute,
    metadata: { oldContent, newContent },
  };
}

/**
 * Create an image operation command
 */
export function createImageCommand(
  action: 'create' | 'delete' | 'edit',
  description: string,
  execute: () => void,
  undo: () => void,
  metadata?: Record<string, any>
): Command {
  return {
    id: `image-${action}-${Date.now()}`,
    type: 'image',
    action,
    description,
    timestamp: Date.now(),
    execute,
    undo,
    metadata,
  };
}

/**
 * Create a formatting command
 */
export function createFormattingCommand(
  description: string,
  oldFormatting: Record<string, any>,
  newFormatting: Record<string, any>,
  execute: () => void,
  undo: () => void
): Command {
  return {
    id: `format-${Date.now()}`,
    type: 'formatting',
    action: 'edit',
    description,
    timestamp: Date.now(),
    execute,
    undo,
    redo: execute,
    metadata: { oldFormatting, newFormatting },
  };
}
