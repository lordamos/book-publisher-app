import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Palette, Type, Ruler, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface TemplateCustomizerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialTemplate?: {
    name: string;
    genre: string;
    coverColor: string;
    accentColor: string;
    bodyFont: string;
    headingFont: string;
    bodyFontSize: number;
    headingFontSize: number;
    lineHeight: string;
    marginTop: string;
    marginBottom: string;
    marginLeft: string;
    marginRight: string;
    chapterStyle: string;
    includeTableOfContents: boolean;
    includeFrontMatter: boolean;
    includeBackMatter: boolean;
  };
  onSave: (customTemplate: any) => void;
}

const FONT_OPTIONS = [
  "Georgia",
  "Helvetica",
  "Courier New",
  "Times New Roman",
  "Palatino",
  "Garamond",
  "Trebuchet MS",
  "Arial",
];

const CHAPTER_STYLES = [
  { value: "numbered", label: "Numbered (1, 2, 3...)" },
  { value: "titled", label: "Titled (Chapter Name)" },
  { value: "decorated", label: "Decorated (✦ Chapter ✦)" },
];

export function TemplateCustomizer({
  isOpen,
  onOpenChange,
  initialTemplate,
  onSave,
}: TemplateCustomizerProps) {
  const [templateName, setTemplateName] = useState(initialTemplate?.name || "My Custom Template");
  const [coverColor, setCoverColor] = useState(initialTemplate?.coverColor || "#1a1a1a");
  const [accentColor, setAccentColor] = useState(initialTemplate?.accentColor || "#ff6b6b");
  const [bodyFont, setBodyFont] = useState(initialTemplate?.bodyFont || "Georgia");
  const [headingFont, setHeadingFont] = useState(initialTemplate?.headingFont || "Helvetica-Bold");
  const [bodyFontSize, setBodyFontSize] = useState(initialTemplate?.bodyFontSize || 12);
  const [headingFontSize, setHeadingFontSize] = useState(initialTemplate?.headingFontSize || 24);
  const [lineHeight, setLineHeight] = useState(
    parseFloat(initialTemplate?.lineHeight || "1.5")
  );
  const [marginTop, setMarginTop] = useState(
    parseFloat(initialTemplate?.marginTop || "0.75")
  );
  const [marginBottom, setMarginBottom] = useState(
    parseFloat(initialTemplate?.marginBottom || "0.75")
  );
  const [marginLeft, setMarginLeft] = useState(
    parseFloat(initialTemplate?.marginLeft || "0.75")
  );
  const [marginRight, setMarginRight] = useState(
    parseFloat(initialTemplate?.marginRight || "0.75")
  );
  const [chapterStyle, setChapterStyle] = useState(
    initialTemplate?.chapterStyle || "numbered"
  );
  const [includeTableOfContents, setIncludeTableOfContents] = useState(
    initialTemplate?.includeTableOfContents ?? true
  );
  const [includeFrontMatter, setIncludeFrontMatter] = useState(
    initialTemplate?.includeFrontMatter ?? true
  );
  const [includeBackMatter, setIncludeBackMatter] = useState(
    initialTemplate?.includeBackMatter ?? true
  );

  const previewStyle = useMemo(
    () => ({
      backgroundColor: coverColor,
      color: accentColor,
      fontFamily: bodyFont,
      lineHeight: lineHeight,
      padding: `${marginTop}in`,
    }),
    [coverColor, accentColor, bodyFont, lineHeight, marginTop]
  );

  const handleReset = () => {
    if (initialTemplate) {
      setCoverColor(initialTemplate.coverColor);
      setAccentColor(initialTemplate.accentColor);
      setBodyFont(initialTemplate.bodyFont);
      setHeadingFont(initialTemplate.headingFont);
      setBodyFontSize(initialTemplate.bodyFontSize);
      setHeadingFontSize(initialTemplate.headingFontSize);
      setLineHeight(parseFloat(initialTemplate.lineHeight));
      setMarginTop(parseFloat(initialTemplate.marginTop));
      setMarginBottom(parseFloat(initialTemplate.marginBottom));
      setMarginLeft(parseFloat(initialTemplate.marginLeft));
      setMarginRight(parseFloat(initialTemplate.marginRight));
      setChapterStyle(initialTemplate.chapterStyle);
      setIncludeTableOfContents(initialTemplate.includeTableOfContents);
      setIncludeFrontMatter(initialTemplate.includeFrontMatter);
      setIncludeBackMatter(initialTemplate.includeBackMatter);
      toast.success("Template reset to defaults");
    }
  };

  const handleSave = () => {
    const customTemplate = {
      name: templateName,
      genre: initialTemplate?.genre || "Custom",
      description: `Custom template based on ${initialTemplate?.name || "default"}`,
      coverColor,
      accentColor,
      bodyFont,
      headingFont,
      bodyFontSize,
      headingFontSize,
      lineHeight: lineHeight.toString(),
      marginTop: marginTop.toString(),
      marginBottom: marginBottom.toString(),
      marginLeft: marginLeft.toString(),
      marginRight: marginRight.toString(),
      chapterStyle,
      includeTableOfContents,
      includeFrontMatter,
      includeBackMatter,
    };

    onSave(customTemplate);
    onOpenChange(false);
    toast.success("Custom template saved!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Template</DialogTitle>
          <DialogDescription>
            Adjust colors, fonts, margins, and layout settings to create your perfect book template
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="colors" className="flex items-center gap-1">
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">Colors</span>
                </TabsTrigger>
                <TabsTrigger value="typography" className="flex items-center gap-1">
                  <Type className="w-4 h-4" />
                  <span className="hidden sm:inline">Type</span>
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  <span className="hidden sm:inline">Layout</span>
                </TabsTrigger>
                <TabsTrigger value="options">Options</TabsTrigger>
              </TabsList>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name" className="text-base font-semibold mb-2 block">
                      Template Name
                    </Label>
                    <Input
                      id="template-name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="My Custom Template"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cover-color" className="text-base font-semibold mb-2 block">
                      Cover Color
                    </Label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-16 h-16 rounded border-2 border-gray-300 cursor-pointer"
                        style={{ backgroundColor: coverColor }}
                        onClick={() => {
                          const input = document.getElementById("cover-color-input") as HTMLInputElement;
                          input?.click();
                        }}
                      />
                      <div className="flex-1">
                        <Input
                          id="cover-color-input"
                          type="color"
                          value={coverColor}
                          onChange={(e) => setCoverColor(e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                      <Input
                        type="text"
                        value={coverColor}
                        onChange={(e) => setCoverColor(e.target.value)}
                        className="w-24"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accent-color" className="text-base font-semibold mb-2 block">
                      Accent Color
                    </Label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-16 h-16 rounded border-2 border-gray-300 cursor-pointer"
                        style={{ backgroundColor: accentColor }}
                        onClick={() => {
                          const input = document.getElementById("accent-color-input") as HTMLInputElement;
                          input?.click();
                        }}
                      />
                      <div className="flex-1">
                        <Input
                          id="accent-color-input"
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                      <Input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-24"
                        placeholder="#ff0000"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Typography Tab */}
              <TabsContent value="typography" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="body-font" className="text-base font-semibold mb-2 block">
                      Body Font
                    </Label>
                    <Select value={bodyFont} onValueChange={setBodyFont}>
                      <SelectTrigger id="body-font">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="body-font-size" className="text-base font-semibold mb-2 block">
                      Body Font Size: {bodyFontSize}pt
                    </Label>
                    <Slider
                      id="body-font-size"
                      min={8}
                      max={20}
                      step={1}
                      value={[bodyFontSize]}
                      onValueChange={(value) => setBodyFontSize(value[0])}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="heading-font" className="text-base font-semibold mb-2 block">
                      Heading Font
                    </Label>
                    <Select value={headingFont} onValueChange={setHeadingFont}>
                      <SelectTrigger id="heading-font">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="heading-font-size" className="text-base font-semibold mb-2 block">
                      Heading Font Size: {headingFontSize}pt
                    </Label>
                    <Slider
                      id="heading-font-size"
                      min={16}
                      max={48}
                      step={1}
                      value={[headingFontSize]}
                      onValueChange={(value) => setHeadingFontSize(value[0])}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="line-height" className="text-base font-semibold mb-2 block">
                      Line Height: {lineHeight.toFixed(1)}
                    </Label>
                    <Slider
                      id="line-height"
                      min={1}
                      max={2}
                      step={0.1}
                      value={[lineHeight]}
                      onValueChange={(value) => setLineHeight(value[0])}
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="margin-top" className="text-base font-semibold mb-2 block">
                      Top Margin: {marginTop.toFixed(2)}"
                    </Label>
                    <Slider
                      id="margin-top"
                      min={0}
                      max={2}
                      step={0.1}
                      value={[marginTop]}
                      onValueChange={(value) => setMarginTop(value[0])}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="margin-bottom" className="text-base font-semibold mb-2 block">
                      Bottom Margin: {marginBottom.toFixed(2)}"
                    </Label>
                    <Slider
                      id="margin-bottom"
                      min={0}
                      max={2}
                      step={0.1}
                      value={[marginBottom]}
                      onValueChange={(value) => setMarginBottom(value[0])}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="margin-left" className="text-base font-semibold mb-2 block">
                      Left Margin: {marginLeft.toFixed(2)}"
                    </Label>
                    <Slider
                      id="margin-left"
                      min={0}
                      max={2}
                      step={0.1}
                      value={[marginLeft]}
                      onValueChange={(value) => setMarginLeft(value[0])}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="margin-right" className="text-base font-semibold mb-2 block">
                      Right Margin: {marginRight.toFixed(2)}"
                    </Label>
                    <Slider
                      id="margin-right"
                      min={0}
                      max={2}
                      step={0.1}
                      value={[marginRight]}
                      onValueChange={(value) => setMarginRight(value[0])}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="chapter-style" className="text-base font-semibold mb-2 block">
                      Chapter Style
                    </Label>
                    <Select value={chapterStyle} onValueChange={setChapterStyle}>
                      <SelectTrigger id="chapter-style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHAPTER_STYLES.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Options Tab */}
              <TabsContent value="options" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="toc-toggle" className="text-base font-semibold">
                      Include Table of Contents
                    </Label>
                    <Switch
                      id="toc-toggle"
                      checked={includeTableOfContents}
                      onCheckedChange={setIncludeTableOfContents}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="front-matter-toggle" className="text-base font-semibold">
                      Include Front Matter
                    </Label>
                    <Switch
                      id="front-matter-toggle"
                      checked={includeFrontMatter}
                      onCheckedChange={setIncludeFrontMatter}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="back-matter-toggle" className="text-base font-semibold">
                      Include Back Matter
                    </Label>
                    <Switch
                      id="back-matter-toggle"
                      checked={includeBackMatter}
                      onCheckedChange={setIncludeBackMatter}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <h3 className="font-semibold text-lg">Live Preview</h3>
              <Card className="overflow-hidden">
                <div
                  style={previewStyle}
                  className="w-full h-64 flex flex-col justify-between p-4 text-white"
                >
                  <div>
                    <div
                      style={{ fontSize: `${headingFontSize}px`, fontFamily: headingFont }}
                      className="font-bold mb-2"
                    >
                      Chapter Title
                    </div>
                    <div
                      style={{ fontSize: `${bodyFontSize}px`, fontFamily: bodyFont }}
                      className="text-sm"
                    >
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </div>
                  </div>
                  <div
                    style={{ color: accentColor }}
                    className="text-center text-xs font-semibold"
                  >
                    Preview
                  </div>
                </div>
              </Card>

              <div className="space-y-2 text-xs">
                <div className="p-2 bg-gray-100 rounded">
                  <strong>Colors:</strong>
                  <div>Cover: {coverColor}</div>
                  <div>Accent: {accentColor}</div>
                </div>
                <div className="p-2 bg-gray-100 rounded">
                  <strong>Margins:</strong>
                  <div>
                    {marginTop.toFixed(2)}" × {marginLeft.toFixed(2)}"
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                  disabled={!initialTemplate}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  Save Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
