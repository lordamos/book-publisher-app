import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TemplateSelectorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (templateId: number) => void;
}

export function TemplateSelector({
  isOpen,
  onOpenChange,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const { data: templates, isLoading } = trpc.templates.list.useQuery();

  const genres = templates
    ? Array.from(new Set(templates.map((t) => t.genre)))
    : [];

  const filteredTemplates = selectedGenre
    ? templates?.filter((t) => t.genre === selectedGenre)
    : templates;

  const handleSelectTemplate = (templateId: number) => {
    onSelectTemplate(templateId);
    onOpenChange(false);
    toast.success("Template applied to your book");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Book Template</DialogTitle>
          <DialogDescription>
            Select from professionally designed templates for different genres to get started quickly
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Genre Filter */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Filter by Genre</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedGenre === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGenre(null)}
                >
                  All Templates
                </Button>
                {genres.map((genre) => (
                  <Button
                    key={genre}
                    variant={selectedGenre === genre ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates?.map((template) => (
                <Card
                  key={template.id}
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {/* Color Preview */}
                  <div className="flex gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded border"
                      style={{ backgroundColor: template.coverColor || "#1a1a1a" }}
                      title="Cover Color"
                    />
                    <div
                      className="w-12 h-12 rounded border"
                      style={{ backgroundColor: template.accentColor || "#ff6b6b" }}
                      title="Accent Color"
                    />
                  </div>

                  {/* Template Info */}
                  <h4 className="font-semibold text-lg mb-2">{template.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                  {/* Template Details */}
                  <div className="space-y-2 mb-4 text-xs text-gray-700">
                    <div>
                      <strong>Fonts:</strong> {template.bodyFont} / {template.headingFont}
                    </div>
                    <div>
                      <strong>Font Sizes:</strong> Body {template.bodyFontSize}pt / Heading{" "}
                      {template.headingFontSize}pt
                    </div>
                    <div>
                      <strong>Line Height:</strong> {template.lineHeight}
                    </div>
                    <div>
                      <strong>Margins:</strong> {template.marginTop}" all sides
                    </div>
                    <div>
                      <strong>Chapter Style:</strong> {template.chapterStyle}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.includeTableOfContents === 1 && (
                      <Badge variant="secondary" className="text-xs">
                        TOC
                      </Badge>
                    )}
                    {template.includeFrontMatter === 1 && (
                      <Badge variant="secondary" className="text-xs">
                        Front Matter
                      </Badge>
                    )}
                    {template.includeBackMatter === 1 && (
                      <Badge variant="secondary" className="text-xs">
                        Back Matter
                      </Badge>
                    )}
                  </div>

                  {/* Select Button */}
                  <Button
                    className="w-full"
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    Use This Template
                  </Button>
                </Card>
              ))}
            </div>

            {filteredTemplates?.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No templates found for this genre</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
