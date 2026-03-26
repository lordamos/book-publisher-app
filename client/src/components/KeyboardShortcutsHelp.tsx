import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';
import { formatKeyboardShortcut, KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  title?: string;
  description?: string;
}

export default function KeyboardShortcutsHelp({
  shortcuts,
  title = 'Keyboard Shortcuts',
  description = 'Use these keyboard shortcuts to speed up your workflow',
}: KeyboardShortcutsHelpProps) {
  const filteredShortcuts = shortcuts.filter((s) => s.description);

  if (filteredShortcuts.length === 0) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          title="View keyboard shortcuts"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {filteredShortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-accent/10 bg-accent/5 p-3 transition-all duration-200 hover:border-accent/20 hover:bg-accent/10"
            >
              <span className="text-sm text-foreground">{shortcut.description}</span>
              <Badge
                variant="secondary"
                className="ml-2 font-mono text-xs"
              >
                {formatKeyboardShortcut(shortcut)}
              </Badge>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
          <p className="font-semibold">💡 Tip:</p>
          <p className="mt-1">
            On Mac, use <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-xs shadow-sm dark:bg-gray-800">⌘</kbd> (Command).
            On Windows/Linux, use <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-xs shadow-sm dark:bg-gray-800">Ctrl</kbd>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
