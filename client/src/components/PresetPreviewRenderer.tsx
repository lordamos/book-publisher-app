import { useMemo, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface PresetPreviewRendererProps {
  preset: any;
  bookContent?: {
    title?: string;
    author?: string;
    chapters?: Array<{
      title: string;
      content: string;
    }>;
    pages?: Array<{
      type: "cover" | "chapter" | "body" | "image";
      content: string;
      imageUrl?: string;
    }>;
  };
  selectedPageType?: "cover" | "chapter" | "body";
  onPageTypeChange?: (type: "cover" | "chapter" | "body") => void;
}

export function PresetPreviewRenderer({
  preset,
  bookContent,
  selectedPageType = "body",
  onPageTypeChange,
}: PresetPreviewRendererProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sample content for preview
  const sampleContent = useMemo(() => {
    if (bookContent) {
      return bookContent;
    }

    return {
      title: "The Art of Writing",
      author: "Jane Author",
      chapters: [
        {
          title: "Chapter 1: The Beginning",
          content:
            "Every great book begins with a single word. The journey of writing is one of discovery, creativity, and perseverance. In this chapter, we explore the fundamental principles that guide successful authors through their creative process.",
        },
        {
          title: "Chapter 2: Finding Your Voice",
          content:
            "Your unique voice is what sets your writing apart from others. It is the combination of your perspective, experiences, and personality that shines through every page. Developing your voice takes time and practice, but it is essential for creating compelling narratives.",
        },
      ],
    };
  }, [bookContent]);

  // Generate preview styles based on preset
  const previewStyles = useMemo(() => {
    return {
      backgroundColor: preset.coverColor || "#ffffff",
      color: preset.accentColor || "#000000",
      fontFamily: preset.bodyFont || "Georgia, serif",
      fontSize: `${preset.bodyFontSize || 12}pt`,
      lineHeight: preset.lineHeight || "1.5",
      padding: `${preset.marginTop || "0.75"}in ${preset.marginRight || "0.75"}in ${preset.marginBottom || "0.75"}in ${preset.marginLeft || "0.75"}in`,
    };
  }, [preset]);

  const headingStyles = useMemo(() => {
    return {
      fontFamily: preset.headingFont || "Georgia, serif",
      fontSize: `${preset.headingFontSize || 24}pt`,
      fontWeight: "bold",
      marginBottom: "0.5in",
      color: preset.accentColor || "#000000",
    };
  }, [preset]);

  const renderCoverPage = () => (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-8 rounded-lg"
      style={{
        backgroundColor: preset.coverColor || "#ffffff",
        color: preset.accentColor || "#000000",
        fontFamily: preset.headingFont || "Georgia, serif",
      }}
    >
      <div className="text-center space-y-6">
        <h1
          className="text-4xl font-bold"
          style={{
            fontSize: `${(preset.headingFontSize || 24) * 1.5}pt`,
            color: preset.accentColor || "#000000",
          }}
        >
          {sampleContent.title}
        </h1>
        <p
          className="text-xl"
          style={{
            fontSize: `${(preset.bodyFontSize || 12) * 1.3}pt`,
            color: preset.accentColor || "#000000",
          }}
        >
          by {sampleContent.author}
        </p>
        <div
          className="h-1 w-24 mx-auto"
          style={{ backgroundColor: preset.accentColor || "#000000" }}
        />
      </div>
    </div>
  );

  const renderChapterPage = () => {
    const chapter = sampleContent.chapters?.[0];
    if (!chapter) return null;

    const chapterStyles = {
      backgroundColor: preset.coverColor || "#ffffff",
      color: preset.accentColor || "#000000",
    };

    return (
      <div
        className="w-full rounded-lg p-8 space-y-6"
        style={{
          ...chapterStyles,
          ...previewStyles,
        }}
      >
        <div>
          {preset.chapterStyle === "numbered" && (
            <p style={{ ...headingStyles, marginBottom: "0.25in" }}>Chapter 1</p>
          )}
          <h2 style={headingStyles}>{chapter.title}</h2>
        </div>
        <p style={{ lineHeight: preset.lineHeight || "1.5" }}>{chapter.content}</p>
      </div>
    );
  };

  const renderBodyPage = () => {
    const chapter = sampleContent.chapters?.[1];
    if (!chapter) return null;

    const bodyStyles = {
      backgroundColor: preset.coverColor || "#ffffff",
      color: preset.accentColor || "#000000",
    };

    return (
      <div
        className="w-full rounded-lg p-8 space-y-6"
        style={{
          ...bodyStyles,
          ...previewStyles,
        }}
      >
        <h2 style={headingStyles}>{chapter.title}</h2>
        <p style={{ lineHeight: preset.lineHeight || "1.5" }}>{chapter.content}</p>
        <p style={{ lineHeight: preset.lineHeight || "1.5" }}>
          The process of writing is deeply personal. Each author brings their own unique perspective
          and experiences to their work. By understanding your own writing style and preferences, you
          can create content that resonates with your readers and stands out in a crowded marketplace.
        </p>
      </div>
    );
  };

  const renderPageContent = () => {
    switch (selectedPageType) {
      case "cover":
        return renderCoverPage();
      case "chapter":
        return renderChapterPage();
      case "body":
      default:
        return renderBodyPage();
    }
  };

  const handleZoom = (direction: "in" | "out") => {
    if (direction === "in") {
      setZoom((prev) => Math.min(prev + 10, 200));
    } else {
      setZoom((prev) => Math.max(prev - 10, 50));
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview Controls */}
      <div className="flex items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg">
        <Tabs value={selectedPageType} onValueChange={(v) => onPageTypeChange?.(v as any)}>
          <TabsList>
            <TabsTrigger value="cover">Cover</TabsTrigger>
            <TabsTrigger value="chapter">Chapter</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom("out")}
            disabled={zoom <= 50}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom("in")}
            disabled={zoom >= 200}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Preview Container */}
      <Card className="overflow-auto bg-gray-100 p-8" style={{ height: isFullscreen ? "80vh" : "500px" }}>
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            transition: "transform 0.2s ease-out",
          }}
        >
          <div
            className="bg-white shadow-lg"
            style={{
              width: "8.5in",
              minHeight: "11in",
              margin: "0 auto",
            }}
          >
            {renderPageContent()}
          </div>
        </div>
      </Card>

      {/* Preset Info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Preset: {preset.name}</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
            <div>
              <strong>Fonts:</strong> {preset.bodyFont} / {preset.headingFont}
            </div>
            <div>
              <strong>Sizes:</strong> {preset.bodyFontSize}pt / {preset.headingFontSize}pt
            </div>
            <div>
              <strong>Line Height:</strong> {preset.lineHeight}
            </div>
            <div>
              <strong>Margins:</strong> {preset.marginTop}" all sides
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
