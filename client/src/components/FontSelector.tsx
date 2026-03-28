/**
 * Font Selector Component
 * 
 * Allows users to select and preview fonts for cover headings and body text
 */

import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Type, Palette } from 'lucide-react';

export interface FontSelectorProps {
  onFontChange?: (fonts: { heading: string; body: string }) => void;
  defaultHeadingFont?: string;
  defaultBodyFont?: string;
}

export function FontSelector({
  onFontChange,
  defaultHeadingFont = 'playfair-display',
  defaultBodyFont = 'inter'
}: FontSelectorProps) {
  const [selectedHeadingFont, setSelectedHeadingFont] = useState(defaultHeadingFont);
  const [selectedBodyFont, setSelectedBodyFont] = useState(defaultBodyFont);
  const [headingWeight, setHeadingWeight] = useState('700');
  const [bodyWeight, setBodyWeight] = useState('400');
  const [headingStyle, setHeadingStyle] = useState('normal');
  const [bodyStyle, setBodyStyle] = useState('normal');
  const [selectedPairStyle, setSelectedPairStyle] = useState<'classic' | 'modern' | 'elegant' | 'bold' | 'playful'>('classic');

  // Queries
  const { data: allFonts } = trpc.fonts.listFonts.useQuery();
  const { data: headingFonts } = trpc.fonts.getHeadingFonts.useQuery();
  const { data: bodyFonts } = trpc.fonts.getBodyFonts.useQuery();
  const { data: fontPairs } = trpc.fonts.getFontPairs.useQuery({ style: selectedPairStyle });
  const { data: fontPairings } = trpc.fonts.getFontPairings.useQuery({ fontId: selectedHeadingFont });

  const handleFontChange = (heading: string, body: string) => {
    setSelectedHeadingFont(heading);
    setSelectedBodyFont(body);
    onFontChange?.({ heading, body });
  };

  const handleApplyPair = (pair: { heading: string; body: string }) => {
    handleFontChange(pair.heading, pair.body);
  };

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual">Manual</TabsTrigger>
          <TabsTrigger value="pairs">Pairs</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Manual Selection Tab */}
        <TabsContent value="manual" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Heading Font Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Heading Font
                </CardTitle>
                <CardDescription>Choose font for titles and headings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="heading-font">Font</Label>
                  <Select value={selectedHeadingFont} onValueChange={setSelectedHeadingFont}>
                    <SelectTrigger id="heading-font">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {headingFonts?.fonts.map((font: any) => (
                        <SelectItem key={font.id} value={font.id}>
                          <span className="flex items-center gap-2">
                            {font.name}
                            <Badge variant="outline" className="text-xs">{font.category}</Badge>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="heading-weight">Weight</Label>
                    <Select value={headingWeight} onValueChange={setHeadingWeight}>
                      <SelectTrigger id="heading-weight">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="400">Regular</SelectItem>
                        <SelectItem value="600">Semibold</SelectItem>
                        <SelectItem value="700">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="heading-style">Style</Label>
                    <Select value={headingStyle} onValueChange={setHeadingStyle}>
                      <SelectTrigger id="heading-style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="italic">Italic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <p
                    style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '28px',
                      fontWeight: parseInt(headingWeight),
                      fontStyle: headingStyle as any
                    }}
                  >
                    The Quick Brown Fox
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Body Font Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Body Font
                </CardTitle>
                <CardDescription>Choose font for body text</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="body-font">Font</Label>
                  <Select value={selectedBodyFont} onValueChange={setSelectedBodyFont}>
                    <SelectTrigger id="body-font">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyFonts?.fonts.map((font: any) => (
                        <SelectItem key={font.id} value={font.id}>
                          <span className="flex items-center gap-2">
                            {font.name}
                            <Badge variant="outline" className="text-xs">{font.category}</Badge>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="body-weight">Weight</Label>
                    <Select value={bodyWeight} onValueChange={setBodyWeight}>
                      <SelectTrigger id="body-weight">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="400">Regular</SelectItem>
                        <SelectItem value="600">Semibold</SelectItem>
                        <SelectItem value="700">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="body-style">Style</Label>
                    <Select value={bodyStyle} onValueChange={setBodyStyle}>
                      <SelectTrigger id="body-style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="italic">Italic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: parseInt(bodyWeight),
                      fontStyle: bodyStyle as any,
                      lineHeight: '1.6'
                    }}
                  >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Font Pairs Tab */}
        <TabsContent value="pairs" className="space-y-4">
          <div>
            <Label htmlFor="pair-style">Pair Style</Label>
            <Select value={selectedPairStyle} onValueChange={(value: any) => setSelectedPairStyle(value)}>
              <SelectTrigger id="pair-style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="elegant">Elegant</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
                <SelectItem value="playful">Playful</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fontPairs?.pairs.map((pair: any, index: number) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{pair.description}</CardTitle>
                  <CardDescription className="flex gap-2">
                    <Badge variant="secondary">{pair.style}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">Heading:</p>
                    <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px' }}>
                      {pair.heading}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">Body:</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
                      {pair.body}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleApplyPair(pair)}
                    className="w-full"
                    variant={
                      selectedHeadingFont === pair.heading && selectedBodyFont === pair.body
                        ? 'default'
                        : 'outline'
                    }
                  >
                    {selectedHeadingFont === pair.heading && selectedBodyFont === pair.body
                      ? 'Applied'
                      : 'Apply Pair'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Font Combination Preview</CardTitle>
              <CardDescription>
                Heading: {selectedHeadingFont} | Body: {selectedBodyFont}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
                <h1
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '48px',
                    fontWeight: parseInt(headingWeight),
                    fontStyle: headingStyle as any,
                    marginBottom: '16px'
                  }}
                >
                  Book Title Here
                </h1>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '18px',
                    fontWeight: parseInt(bodyWeight),
                    fontStyle: bodyStyle as any,
                    color: '#666',
                    marginBottom: '24px'
                  }}
                >
                  By Author Name
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: '1.8',
                    color: '#555'
                  }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                </p>
              </div>

              {fontPairings?.pairings && fontPairings.pairings.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Recommended Body Fonts for {selectedHeadingFont}:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {fontPairings?.pairings.map((pairing: any) => (                      <Button
                        key={pairing.id}
                        variant={selectedBodyFont === pairing.id ? 'default' : 'outline'}
                        onClick={() => setSelectedBodyFont(pairing.id)}
                        className="justify-start"
                      >
                        {pairing.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
