import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useState } from "react";

interface AIWritingAssistantProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText?: string;
  onApplySuggestion?: (suggestion: string) => void;
}

export function AIWritingAssistant({
  isOpen,
  onOpenChange,
  selectedText = "",
  onApplySuggestion,
}: AIWritingAssistantProps) {
  const [text, setText] = useState(selectedText);
  const [activeTab, setActiveTab] = useState("suggestions");

  const suggestionsQuery = trpc.ai.suggestions.useQuery(
    { text },
    { enabled: isOpen && text.length > 10 }
  );

  const grammarQuery = trpc.ai.checkGrammar.useQuery(
    { text },
    { enabled: isOpen && text.length > 10 }
  );

  const improveStyleMutation = trpc.ai.improveStyle.useMutation();
  const generateContentMutation = trpc.ai.generateContent.useMutation();

  const handleApplySuggestion = (suggestion: string) => {
    onApplySuggestion?.(suggestion);
    setText(suggestion);
  };

  const handleImproveStyle = async (style: "formal" | "casual" | "academic" | "narrative") => {
    const result = await improveStyleMutation.mutateAsync({
      text,
      targetStyle: style,
    });
    setText(result);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Writing Assistant
          </DialogTitle>
          <DialogDescription>
            Get suggestions, check grammar, and improve your writing style
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Text Input */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Your Text</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your text here..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {text.length} characters
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="grammar">Grammar</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
            </TabsList>

            {/* Suggestions Tab */}
            <TabsContent value="suggestions" className="space-y-3 max-h-64 overflow-y-auto">
              {suggestionsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : suggestionsQuery.data && suggestionsQuery.data.length > 0 ? (
                suggestionsQuery.data.map((suggestion, idx) => (
                  <Card key={idx} className="p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-primary capitalize">
                          {suggestion.type}
                        </p>
                        <p className="text-sm line-through text-muted-foreground">
                          {suggestion.original}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          {suggestion.suggestion}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {suggestion.explanation}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplySuggestion(suggestion.suggestion)}
                      >
                        Apply
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    No suggestions found. Your writing looks great!
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Grammar Tab */}
            <TabsContent value="grammar" className="space-y-3 max-h-64 overflow-y-auto">
              {grammarQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : grammarQuery.data && grammarQuery.data.length > 0 ? (
                grammarQuery.data.map((correction, idx) => (
                  <Card key={idx} className="p-3 space-y-2 border-red-200 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Grammar Issue
                        </p>
                        <p className="text-sm line-through text-muted-foreground">
                          {correction.original}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          {correction.suggestion}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {correction.explanation}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplySuggestion(correction.suggestion)}
                      >
                        Apply
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    No grammar issues found. Perfect!
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Style Tab */}
            <TabsContent value="style" className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleImproveStyle("formal")}
                  disabled={improveStyleMutation.isPending}
                  className="justify-start"
                >
                  {improveStyleMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Formal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleImproveStyle("casual")}
                  disabled={improveStyleMutation.isPending}
                  className="justify-start"
                >
                  {improveStyleMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Casual
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleImproveStyle("academic")}
                  disabled={improveStyleMutation.isPending}
                  className="justify-start"
                >
                  {improveStyleMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Academic
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleImproveStyle("narrative")}
                  disabled={improveStyleMutation.isPending}
                  className="justify-start"
                >
                  {improveStyleMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Narrative
                </Button>
              </div>

              {improveStyleMutation.data && (
                <Card className="p-3 space-y-2 bg-blue-50 border-blue-200">
                  <p className="text-xs font-semibold text-blue-600">Improved Version:</p>
                  <p className="text-sm">{improveStyleMutation.data}</p>
                  <Button
                    size="sm"
                    onClick={() => handleApplySuggestion(improveStyleMutation.data)}
                  >
                    Apply
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>

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
              onClick={() => {
                onApplySuggestion?.(text);
                onOpenChange(false);
              }}
              className="flex-1"
            >
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
