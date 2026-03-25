import { Book, Page, Chapter, BookMetadata } from "@shared/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Type, Image as ImageIcon, Settings, BookOpen, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface BookEditorSidebarProps {
  book: Book;
  currentPage: Page | undefined;
  selectedElements: number[];
  chapters: Chapter[];
  metadata: BookMetadata | undefined;
  onPageContentUpdate?: (content: any) => void;
}

export function BookEditorSidebar({
  book,
  currentPage,
  selectedElements,
  chapters,
  metadata,
  onPageContentUpdate,
}: BookEditorSidebarProps) {
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontWeight, setFontWeight] = useState("normal");
  const [textColor, setTextColor] = useState("#000000");
  const [alignment, setAlignment] = useState("left");

  const updatePageMutation = trpc.pages.update.useMutation();
  const updateBookMutation = trpc.books.update.useMutation();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentPage) return;

    // In a real implementation, upload to S3 first
    // For now, create a data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      // Emit event to add image to page
      onPageContentUpdate?.({
        type: "addImage",
        url,
        width: 300,
        height: 300,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-80 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      <Tabs defaultValue="format" className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b border-border">
          <TabsTrigger value="format" className="flex-1 text-xs">
            <Type className="w-4 h-4 mr-1" />
            Format
          </TabsTrigger>
          <TabsTrigger value="content" className="flex-1 text-xs">
            <BookOpen className="w-4 h-4 mr-1" />
            Content
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 text-xs">
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Format Tab */}
        <TabsContent value="format" className="flex-1 overflow-auto p-4 space-y-4">
          {selectedElements.length > 0 ? (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold">Font Family</Label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
                >
                  <option value="Inter">Inter</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-semibold">Size</Label>
                  <Input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    min="8"
                    max="72"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Weight</Label>
                  <select
                    value={fontWeight}
                    onChange={(e) => setFontWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
                  >
                    <option value="300">Light</option>
                    <option value="400">Normal</option>
                    <option value="600">Semibold</option>
                    <option value="700">Bold</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-10 w-16"
                  />
                  <Input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold mb-2 block">Alignment</Label>
                <div className="flex gap-1">
                  <Button
                    variant={alignment === "left" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setAlignment("left")}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={alignment === "center" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setAlignment("center")}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={alignment === "right" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setAlignment("right")}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={alignment === "justify" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setAlignment("justify")}
                  >
                    <AlignJustify className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Select an element to format
            </p>
          )}
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="flex-1 overflow-auto p-4 space-y-4">
          <div>
            <Label className="text-xs font-semibold mb-2 block">Chapters ({chapters.length})</Label>
            <div className="space-y-2 max-h-48 overflow-auto">
              {chapters.length > 0 ? (
                chapters.map((chapter) => (
                  <Card key={chapter.id} className="p-2 text-sm hover:bg-muted transition-colors cursor-pointer">
                    <p className="font-medium truncate">{chapter.title}</p>
                    <p className="text-xs text-muted-foreground">Chapter {chapter.chapterNumber}</p>
                  </Card>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No chapters yet</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="image-upload" className="text-xs font-semibold mb-2 block cursor-pointer">
              <Button className="w-full" variant="outline" asChild>
                <label className="cursor-pointer">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Upload Image
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </Button>
            </Label>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="flex-1 overflow-auto p-4 space-y-4">
          <div>
            <Label className="text-xs font-semibold">Book Title</Label>
            <Input
              defaultValue={book.title}
              onBlur={(e) => {
                updateBookMutation.mutate({
                  bookId: book.id,
                  data: { title: e.target.value },
                });
              }}
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Author</Label>
            <Input
              defaultValue={book.author ?? ""}
              onBlur={(e) => {
                updateBookMutation.mutate({
                  bookId: book.id,
                  data: { author: e.target.value },
                });
              }}
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Description</Label>
            <Textarea
              defaultValue={book.description ?? ""}
              onBlur={(e) => {
                updateBookMutation.mutate({
                  bookId: book.id,
                  data: { description: e.target.value },
                });
              }}
              rows={3}
            />
          </div>

          {metadata && (
            <>
              <div>
                <Label className="text-xs font-semibold">Trim Size</Label>
                <select
                  defaultValue={metadata.trimSize ?? "6x9"}
                  onChange={(e) => {
                    // Update metadata
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
                >
                  <option>6x9</option>
                  <option>5x8</option>
                  <option>8.5x11</option>
                  <option>Custom</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Paper Type</Label>
                <select
                  defaultValue={metadata.paperType ?? "white"}
                  onChange={(e) => {
                    // Update metadata
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
                >
                  <option value="white">White</option>
                  <option value="cream">Cream</option>
                </select>
              </div>
            </>
          )}

          <Button className="w-full" variant="default">
            Save All Changes
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
