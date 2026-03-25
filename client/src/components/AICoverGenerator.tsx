import { Book } from "@shared/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useState } from "react";

interface AICoverGeneratorProps {
  book: Book;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCoverGenerated?: (imageUrl: string) => void;
}

export function AICoverGenerator({
  book,
  isOpen,
  onOpenChange,
  onCoverGenerated,
}: AICoverGeneratorProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState("");

  const generateDescriptionMutation = trpc.ai.generateCoverDescription.useMutation();

  const handleGenerateDescription = async () => {
    const result = await generateDescriptionMutation.mutateAsync({
      title: book.title || "Untitled",
      author: book.author || "Unknown Author",
      genre: book.category || "Fiction",
      description: book.description || "A compelling book",
    });
    setGeneratedDescription(result);
  };

  const handleGenerateCover = async () => {
    const prompt = customPrompt || generatedDescription;
    if (!prompt) {
      alert("Please generate or provide a cover description first");
      return;
    }

    // In a real implementation, this would call an image generation API
    // For now, we'll show a placeholder
    console.log("Would generate cover with prompt:", prompt);
    onCoverGenerated?.("https://via.placeholder.com/600x900?text=Generated+Cover");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Book Cover Generator
          </DialogTitle>
          <DialogDescription>
            Generate a professional book cover using AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Book Info */}
          <Card className="p-4 bg-muted">
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Title:</span> {book.title}
              </p>
              <p>
                <span className="font-semibold">Author:</span> {book.author || "Not specified"}
              </p>
              <p>
                <span className="font-semibold">Genre:</span> {book.category || "Not specified"}
              </p>
            </div>
          </Card>

          {/* Auto-Generated Description */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Cover Description</Label>
            {generateDescriptionMutation.isPending ? (
              <div className="flex items-center justify-center py-8 border border-dashed rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                <p className="text-sm text-muted-foreground">Generating cover description...</p>
              </div>
            ) : generatedDescription ? (
              <Textarea
                value={generatedDescription}
                onChange={(e) => setGeneratedDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
            ) : (
              <Button
                onClick={handleGenerateDescription}
                variant="outline"
                className="w-full"
                disabled={generateDescriptionMutation.isPending}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Description
              </Button>
            )}
          </div>

          {/* Custom Prompt */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Or Customize Manually</Label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe the cover you want... (optional)"
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to use the AI-generated description
            </p>
          </div>

          {/* Features Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="text-sm">
                <strong>Note:</strong> Cover generation requires image generation API integration.
                The current version generates a placeholder. To enable full functionality, configure
                your image generation service in settings.
              </p>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateCover}
              className="flex-1 gap-2"
              disabled={!generatedDescription && !customPrompt}
            >
              <Sparkles className="w-4 h-4" />
              Generate Cover
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
