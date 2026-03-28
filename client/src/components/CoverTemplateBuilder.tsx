/**
 * Cover Template Builder Component
 * 
 * Allows users to select, customize, and preview cover templates
 */

import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Download, Eye } from 'lucide-react';

export interface CoverTemplateBuilderProps {
  onCoverGenerated?: (url: string, format: 'png' | 'jpeg') => void;
  onPreviewGenerated?: (svgContent: string) => void;
}

export function CoverTemplateBuilder({ onCoverGenerated, onPreviewGenerated }: CoverTemplateBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [previewSvg, setPreviewSvg] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quality, setQuality] = useState(85);

  // Queries
  const { data: templates } = trpc.covertemplates.listTemplates.useQuery();
  const { data: categories } = trpc.covertemplates.getCategories.useQuery();
  const { data: styles } = trpc.covertemplates.getStyles.useQuery();

  // Mutations
  const generatePreviewMutation = trpc.covertemplates.generatePreview.useMutation();
  const generatePngMutation = trpc.covertemplates.generatePNG.useMutation();
  const generateJpegMutation = trpc.covertemplates.generateJPEG.useMutation();
  const validateMutation = trpc.covertemplates.validateCustomization.useQuery(
    {
      templateId: selectedTemplate || '',
      title: title || '',
      author: author || '',
      isbn: isbn || undefined,
      subtitle: subtitle || undefined,
      tagline: tagline || undefined
    },
    { enabled: !!selectedTemplate && !!title && !!author }
  );

  // Auto-select first template
  useEffect(() => {
    if (templates?.templates && templates.templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates.templates[0].id);
    }
  }, [templates, selectedTemplate]);

  const handleGeneratePreview = async () => {
    if (!selectedTemplate || !title || !author) {
      alert('Please fill in template, title, and author');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generatePreviewMutation.mutateAsync({
        templateId: selectedTemplate,
        title: title,
        author: author,
        isbn: isbn || undefined,
        subtitle: subtitle || undefined,
        tagline: tagline || undefined
      });

      if (result.success && 'svgContent' in result) {
        setPreviewSvg(result.svgContent as string);
        onPreviewGenerated?.(result.svgContent as string);
      } else {
        alert('Failed to generate preview');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePNG = async () => {
    if (!selectedTemplate || !title || !author) {
      alert('Please fill in template, title, and author');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generatePngMutation.mutateAsync({
        templateId: selectedTemplate,
        title: title,
        author: author,
        isbn: isbn || undefined,
        subtitle: subtitle || undefined,
        tagline: tagline || undefined
      });

      if (result.success && 'url' in result) {
        onCoverGenerated?.(result.url as string, 'png');
        // Trigger download
        const link = document.createElement('a');
        link.href = result.url as string;
        link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.click();
      } else {
        alert('Failed to generate PNG');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateJPEG = async () => {
    if (!selectedTemplate || !title || !author) {
      alert('Please fill in template, title, and author');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateJpegMutation.mutateAsync({
        templateId: selectedTemplate,
        title: title,
        author: author,
        isbn: isbn || undefined,
        subtitle: subtitle || undefined,
        tagline: tagline || undefined,
        quality
      });

      if (result.success && 'url' in result) {
        onCoverGenerated?.(result.url as string, 'jpeg');
        // Trigger download
        const link = document.createElement('a');
        link.href = result.url as string;
        link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
        link.click();
      } else {
        alert('Failed to generate JPEG');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredTemplates = templates?.templates.filter(t => {
    if (selectedCategory && t.category !== selectedCategory) return false;
    if (selectedStyle && t.style !== selectedStyle) return false;
    return true;
  }) || [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cover Template Builder</CardTitle>
          <CardDescription>Create professional book covers with customizable templates</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="customize">Customize</TabsTrigger>
              <TabsTrigger value="preview">Preview & Export</TabsTrigger>
            </TabsList>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories?.categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="style">Style</Label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger id="style">
                      <SelectValue placeholder="All Styles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Styles</SelectItem>
                      {styles?.styles.map(style => (
                        <SelectItem key={style} value={style}>
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'ring-2 ring-primary'
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-sm">{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-gray-500">
                        <p>Category: {template.category}</p>
                        <p>Style: {template.style}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Customize Tab */}
            <TabsContent value="customize" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Book Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter book title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{title.length}/200</p>
                </div>

                <div>
                  <Label htmlFor="author">Author Name *</Label>
                  <Input
                    id="author"
                    placeholder="Enter author name"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">{author.length}/100</p>
                </div>

                <div>
                  <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                  <Input
                    id="subtitle"
                    placeholder="Enter subtitle"
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="tagline">Tagline (Optional)</Label>
                  <Input
                    id="tagline"
                    placeholder="Enter tagline"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="isbn">ISBN (Optional)</Label>
                  <Input
                    id="isbn"
                    placeholder="Enter ISBN (e.g., 978-0-123456-78-9)"
                    value={isbn}
                    onChange={e => setIsbn(e.target.value)}
                  />
                </div>
              </div>

              {validateMutation.data && !validateMutation.data.valid && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <p className="font-semibold mb-1">Validation Errors:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validateMutation.data.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button onClick={handleGeneratePreview} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Generate Preview
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Preview & Export Tab */}
            <TabsContent value="preview" className="space-y-4">
              {previewSvg ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center" style={{ aspectRatio: '1000/1600' }}>
                    <div
                      dangerouslySetInnerHTML={{ __html: previewSvg }}
                      className="w-full h-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quality">JPEG Quality</Label>
                      <div className="flex items-center gap-2">
                        <input
                          id="quality"
                          type="range"
                          min="1"
                          max="100"
                          value={quality}
                          onChange={e => setQuality(parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm font-semibold w-12 text-right">{quality}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={handleGeneratePNG}
                      disabled={isGenerating}
                      variant="outline"
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Export as PNG
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleGenerateJPEG}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Export as JPEG
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Generate a preview first to see the cover design</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
