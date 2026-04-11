import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Link, X } from "lucide-react";

interface HyperlinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, text: string) => void;
  selectedText?: string;
}

export function HyperlinkDialog({
  isOpen,
  onClose,
  onInsert,
  selectedText = "",
}: HyperlinkDialogProps) {
  const [url, setUrl] = useState("");
  const [linkText, setLinkText] = useState(selectedText);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLinkText(selectedText);
      setUrl("");
      setError("");
    }
  }, [isOpen, selectedText]);

  const validateUrl = (urlString: string): boolean => {
    try {
      // Allow relative URLs and absolute URLs
      if (urlString.startsWith("/") || urlString.startsWith("#")) {
        return true;
      }
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleInsert = () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!validateUrl(url)) {
      setError("Please enter a valid URL (e.g., https://example.com or /page)");
      return;
    }

    if (!linkText.trim()) {
      setError("Please enter link text");
      return;
    }

    onInsert(url, linkText);
    setUrl("");
    setLinkText("");
    setError("");
    onClose();
  };

  const handleRemoveLink = () => {
    onInsert("", linkText);
    setUrl("");
    setLinkText("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Insert Hyperlink
          </DialogTitle>
          <DialogDescription>
            Add a hyperlink to your text to make it interactive
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Link Text */}
          <div>
            <Label htmlFor="link-text">Link Text</Label>
            <Input
              id="link-text"
              placeholder="Text to display"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* URL Input */}
          <div>
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com or /page"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter a full URL (https://...) or relative path (/page, #section)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 bg-destructive/10 text-destructive text-sm rounded">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {url && (
              <Button
                variant="ghost"
                onClick={handleRemoveLink}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4 mr-2" />
                Remove Link
              </Button>
            )}
            <Button onClick={handleInsert} disabled={!url.trim() || !linkText.trim()}>
              <Link className="w-4 h-4 mr-2" />
              Insert Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
