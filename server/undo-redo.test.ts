import { describe, it, expect, beforeEach } from 'vitest';
import {
  CommandHistory,
  createPageCommand,
  createTextCommand,
  createImageCommand,
  createFormattingCommand,
} from '../client/src/lib/commandHistory';

describe('Command History System', () => {
  let history: CommandHistory;

  beforeEach(() => {
    history = new CommandHistory(100);
  });

  describe('CommandHistory', () => {
    it('should execute a command', () => {
      let executed = false;
      const command = createPageCommand(
        'create',
        'Test page creation',
        () => { executed = true; },
        () => { executed = false; }
      );

      history.execute(command);
      expect(executed).toBe(true);
      expect(history.canUndo()).toBe(true);
    });

    it('should undo a command', () => {
      let state = 'initial';
      const command = createPageCommand(
        'create',
        'Test page creation',
        () => { state = 'executed'; },
        () => { state = 'undone'; }
      );

      history.execute(command);
      expect(state).toBe('executed');

      history.undo();
      expect(state).toBe('undone');
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(true);
    });

    it('should redo a command', () => {
      let state = 'initial';
      const command = createPageCommand(
        'create',
        'Test page creation',
        () => { state = 'executed'; },
        () => { state = 'undone'; }
      );

      history.execute(command);
      history.undo();
      expect(state).toBe('undone');

      history.redo();
      expect(state).toBe('executed');
      expect(history.canRedo()).toBe(false);
    });

    it('should handle multiple commands in sequence', () => {
      const states: string[] = [];

      const cmd1 = createPageCommand(
        'create',
        'Create page 1',
        () => states.push('page1'),
        () => states.pop()
      );

      const cmd2 = createPageCommand(
        'create',
        'Create page 2',
        () => states.push('page2'),
        () => states.pop()
      );

      history.execute(cmd1);
      history.execute(cmd2);
      expect(states).toEqual(['page1', 'page2']);

      history.undo();
      expect(states).toEqual(['page1']);

      history.undo();
      expect(states).toEqual([]);

      history.redo();
      expect(states).toEqual(['page1']);

      history.redo();
      expect(states).toEqual(['page1', 'page2']);
    });

    it('should clear history when new command executed after undo', () => {
      let counter = 0;

      const cmd1 = createPageCommand(
        'create',
        'Command 1',
        () => counter++,
        () => counter--
      );

      const cmd2 = createPageCommand(
        'create',
        'Command 2',
        () => counter++,
        () => counter--
      );

      history.execute(cmd1);
      history.execute(cmd2);
      expect(counter).toBe(2);

      history.undo();
      expect(counter).toBe(1);

      history.execute(cmd1);
      expect(counter).toBe(2);
      expect(history.canRedo()).toBe(false);
    });

    it('should enforce max size limit', () => {
      const smallHistory = new CommandHistory(3);
      const commands: string[] = [];

      for (let i = 0; i < 5; i++) {
        const cmd = createPageCommand(
          'create',
          `Command ${i}`,
          () => commands.push(`cmd${i}`),
          () => commands.pop()
        );
        smallHistory.execute(cmd);
      }

      expect(smallHistory.getSize()).toBe(3);
    });

    it('should return command descriptions', () => {
      const cmd = createPageCommand(
        'create',
        'Add new page',
        () => {},
        () => {}
      );

      history.execute(cmd);
      expect(history.getLastCommandDescription()).toBe('Add new page');

      history.undo();
      expect(history.getLastCommandDescription()).toBeNull();
    });

    it('should track redo descriptions', () => {
      const cmd = createPageCommand(
        'create',
        'Delete page',
        () => {},
        () => {}
      );

      history.execute(cmd);
      expect(history.getNextRedoDescription()).toBeNull();

      history.undo();
      expect(history.getNextRedoDescription()).toBe('Delete page');
    });
  });

  describe('Page Commands', () => {
    it('should create page command', () => {
      let pages: string[] = [];

      const cmd = createPageCommand(
        'create',
        'Create new page',
        () => pages.push('page1'),
        () => pages.pop()
      );

      expect(cmd.type).toBe('page');
      expect(cmd.action).toBe('create');
      expect(cmd.description).toBe('Create new page');

      history.execute(cmd);
      expect(pages).toEqual(['page1']);
    });

    it('should create delete page command', () => {
      let pages = ['page1', 'page2'];

      const cmd = createPageCommand(
        'delete',
        'Delete page 2',
        () => pages.pop(),
        () => pages.push('page2')
      );

      expect(cmd.action).toBe('delete');
      history.execute(cmd);
      expect(pages).toEqual(['page1']);

      history.undo();
      expect(pages).toEqual(['page1', 'page2']);
    });

    it('should create duplicate page command', () => {
      let pages = ['page1'];

      const cmd = createPageCommand(
        'duplicate',
        'Duplicate page 1',
        () => pages.push('page1-copy'),
        () => pages.pop()
      );

      expect(cmd.action).toBe('create');
      history.execute(cmd);
      expect(pages).toEqual(['page1', 'page1-copy']);
    });

    it('should create reorder pages command', () => {
      let pages = ['page1', 'page2', 'page3'];
      const reordered = ['page3', 'page1', 'page2'];

      const cmd = createPageCommand(
        'reorder',
        'Reorder pages',
        () => { pages = [...reordered]; },
        () => { pages = ['page1', 'page2', 'page3']; }
      );

      expect(cmd.action).toBe('reorder');
      history.execute(cmd);
      expect(pages).toEqual(reordered);

      history.undo();
      expect(pages).toEqual(['page1', 'page2', 'page3']);
    });
  });

  describe('Text Commands', () => {
    it('should create text edit command', () => {
      let text = 'Hello';

      const cmd = createTextCommand(
        'Edit text',
        'Hello',
        'Hello World',
        () => { text = 'Hello World'; },
        () => { text = 'Hello'; }
      );

      expect(cmd.type).toBe('text');
      expect(cmd.action).toBe('edit');
      expect(cmd.metadata?.oldContent).toBe('Hello');
      expect(cmd.metadata?.newContent).toBe('Hello World');

      history.execute(cmd);
      expect(text).toBe('Hello World');

      history.undo();
      expect(text).toBe('Hello');

      history.redo();
      expect(text).toBe('Hello World');
    });
  });

  describe('Image Commands', () => {
    it('should create image command', () => {
      let images: string[] = [];

      const cmd = createImageCommand(
        'create',
        'Add image',
        () => images.push('image1.jpg'),
        () => images.pop()
      );

      expect(cmd.type).toBe('image');
      expect(cmd.action).toBe('create');

      history.execute(cmd);
      expect(images).toEqual(['image1.jpg']);

      history.undo();
      expect(images).toEqual([]);
    });

    it('should create image delete command', () => {
      let images = ['image1.jpg', 'image2.jpg'];

      const cmd = createImageCommand(
        'delete',
        'Remove image',
        () => images.pop(),
        () => images.push('image2.jpg')
      );

      expect(cmd.action).toBe('delete');
      history.execute(cmd);
      expect(images).toEqual(['image1.jpg']);
    });
  });

  describe('Formatting Commands', () => {
    it('should create formatting command', () => {
      let formatting = { bold: false, fontSize: 16 };

      const cmd = createFormattingCommand(
        'Make bold',
        { bold: false },
        { bold: true },
        () => { formatting.bold = true; },
        () => { formatting.bold = false; }
      );

      expect(cmd.type).toBe('formatting');
      expect(cmd.action).toBe('edit');
      expect(cmd.metadata?.oldFormatting).toEqual({ bold: false });
      expect(cmd.metadata?.newFormatting).toEqual({ bold: true });

      history.execute(cmd);
      expect(formatting.bold).toBe(true);

      history.undo();
      expect(formatting.bold).toBe(false);
    });
  });

  describe('History State', () => {
    it('should track current position', () => {
      const cmd1 = createPageCommand('create', 'Cmd 1', () => {}, () => {});
      const cmd2 = createPageCommand('create', 'Cmd 2', () => {}, () => {});

      history.execute(cmd1);
      expect(history.getCurrentIndex()).toBe(0);

      history.execute(cmd2);
      expect(history.getCurrentIndex()).toBe(1);

      history.undo();
      expect(history.getCurrentIndex()).toBe(0);

      history.redo();
      expect(history.getCurrentIndex()).toBe(1);
    });

    it('should return correct history size', () => {
      expect(history.getSize()).toBe(0);

      const cmd = createPageCommand('create', 'Test', () => {}, () => {});
      history.execute(cmd);
      expect(history.getSize()).toBe(1);

      history.undo();
      expect(history.getSize()).toBe(1);
    });

    it('should clear history', () => {
      const cmd = createPageCommand('create', 'Test', () => {}, () => {});
      history.execute(cmd);
      expect(history.getSize()).toBe(1);

      history.clear();
      expect(history.getSize()).toBe(0);
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);
    });
  });
});
