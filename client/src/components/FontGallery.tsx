/**
 * FontGallery Component
 * 
 * Displays cached font preview images in a responsive grid with lazy loading,
 * filtering, search, and infinite scroll pagination.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Grid3x3, List } from 'lucide-react';

interface FontPreviewItem {
  id: string;
  headingFont: string;
  bodyFont: string;
  headingWeight: string;
  bodyWeight: string;
  headingStyle: string;
  bodyStyle: string;
  category?: string;
  style?: string;
  thumbnailUrl?: string;
  smallUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
}

interface FontGalleryProps {
  onSelectFontPair?: (fonts: {
    headingFont: string;
    bodyFont: string;
    headingWeight: string;
    bodyWeight: string;
    headingStyle: string;
    bodyStyle: string;
  }) => void;
  maxColumns?: number;
  showSearch?: boolean;
  showFilter?: boolean;
  enableInfiniteScroll?: boolean;
}

export function FontGallery({
  onSelectFontPair,
  maxColumns = 4,
  showSearch = true,
  showFilter = true,
  enableInfiniteScroll = true
}: FontGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [fontPreviews, setFontPreviews] = useState<FontPreviewItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Get font pairs query
  const { data: fontPairsData, isLoading: isPairsLoading } = trpc.fonts.getFontPairs.useQuery({});

  // Get cached previews - using getFontPairs
  const { data: previewsData, isLoading: isPreviewsLoading } = trpc.fonts.getFontPairs.useQuery({});

  // Initialize font previews
  useEffect(() => {
    if (previewsData && Array.isArray(previewsData)) {
      const pairsAsItems: FontPreviewItem[] = (previewsData?.pairs || []).map((pair: any) => ({
        id: `${pair.heading}-${pair.body}`,
        headingFont: pair.heading,
        bodyFont: pair.body,
        headingWeight: '700',
        bodyWeight: '400',
        headingStyle: 'normal',
        bodyStyle: 'normal',
        category: pair.style,
        style: pair.style,
        mediumUrl: undefined,
        smallUrl: undefined,
        largeUrl: undefined,
        thumbnailUrl: undefined
      }));
      
      if (page === 1) {
        setFontPreviews(pairsAsItems);
      } else {
        setFontPreviews(prev => [...prev, ...pairsAsItems]);
      }
      setHasMore(false); // No pagination for now
    }
  }, [previewsData, page]);

  // Infinite scroll observer
  useEffect(() => {
    if (!enableInfiniteScroll || !observerTarget.current) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isPreviewsLoading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isPreviewsLoading, enableInfiniteScroll]);

  // Filter and search
  const filteredPreviews = fontPreviews.filter(preview => {
    const matchesSearch =
      searchQuery === '' ||
      preview.headingFont.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preview.bodyFont.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || preview.category === selectedCategory;
    const matchesStyle = selectedStyle === 'all' || preview.style === selectedStyle;

    return matchesSearch && matchesCategory && matchesStyle;
  });

  // Get unique categories and styles
  const categories = Array.from(
    new Set(fontPreviews.map(p => p.category || '').filter(Boolean))
  );
  const styles = Array.from(
    new Set(fontPreviews.map(p => p.style || '').filter(Boolean))
  );

  const handleSelectFontPair = useCallback((preview: FontPreviewItem) => {
    if (onSelectFontPair) {
      onSelectFontPair({
        headingFont: preview.headingFont,
        bodyFont: preview.bodyFont,
        headingWeight: preview.headingWeight,
        bodyWeight: preview.bodyWeight,
        headingStyle: preview.headingStyle,
        bodyStyle: preview.bodyStyle
      });
    }
  }, [onSelectFontPair]);

  const isLoading_state = isPairsLoading || isPreviewsLoading || isLoading;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Font Gallery</h2>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        {(showSearch || showFilter) && (
          <div className="space-y-3">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search fonts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {showFilter && (
              <div className="flex gap-3 flex-wrap">
                {categories.length > 0 && (
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat || 'uncategorized'}>
                          {cat || 'Uncategorized'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {styles.length > 0 && (
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Styles</SelectItem>
                      {styles.map(style => (
                        <SelectItem key={style} value={style || 'uncategorized'}>
                          {style || 'Uncategorized'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      {viewMode === 'grid' ? (
        <div
          className={`grid gap-4`}
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${Math.floor(100 / maxColumns)}%, 1fr))`
          }}
        >
          {filteredPreviews.map((preview, idx) => (
            <FontPreviewCard
              key={`${preview.headingFont}-${preview.bodyFont}-${idx}`}
              preview={preview}
              onSelect={() => handleSelectFontPair(preview)}
              isLoading={isLoading_state}
            />
          ))}
        </div>
      ) : (
        /* Gallery List */
        <div className="space-y-2">
          {filteredPreviews.map((preview, idx) => (
            <FontPreviewListItem
              key={`${preview.headingFont}-${preview.bodyFont}-${idx}`}
              preview={preview}
              onSelect={() => handleSelectFontPair(preview)}
              isLoading={isLoading_state}
            />
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading_state && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading_state && filteredPreviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No font previews found</p>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {enableInfiniteScroll && hasMore && <div ref={observerTarget} className="h-4" />}

      {/* Results Count */}
      {fontPreviews.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredPreviews.length} of {fontPreviews.length} font pairs
        </div>
      )}
    </div>
  );
}

/**
 * Font Preview Card Component
 */
interface FontPreviewCardProps {
  preview: FontPreviewItem;
  onSelect: () => void;
  isLoading?: boolean;
}

function FontPreviewCard({ preview, onSelect, isLoading }: FontPreviewCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onSelect}
    >
      <div className="relative w-full aspect-video bg-muted">
        {preview.mediumUrl && (
          <img
            src={preview.mediumUrl}
            alt={`${preview.headingFont} + ${preview.bodyFont}`}
            className={`w-full h-full object-cover transition-opacity ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        )}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <div>
          <p className="font-semibold text-sm truncate">{preview.headingFont}</p>
          <p className="text-xs text-muted-foreground truncate">{preview.bodyFont}</p>
        </div>

        <div className="flex gap-1 flex-wrap">
          {preview.category && (
            <Badge variant="secondary" className="text-xs">
              {preview.category}
            </Badge>
          )}
          {preview.style && (
            <Badge variant="outline" className="text-xs">
              {preview.style}
            </Badge>
          )}
        </div>

        <Button
          size="sm"
          className="w-full"
          onClick={e => {
            e.stopPropagation();
            onSelect();
          }}
          disabled={isLoading}
        >
          Select
        </Button>
      </div>
    </Card>
  );
}

/**
 * Font Preview List Item Component
 */
function FontPreviewListItem({ preview, onSelect, isLoading }: FontPreviewCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex gap-4 p-4">
        <div className="relative w-24 h-24 bg-muted flex-shrink-0 rounded">
          {preview.smallUrl && (
            <img
              src={preview.smallUrl}
              alt={`${preview.headingFont} + ${preview.bodyFont}`}
              className={`w-full h-full object-cover rounded transition-opacity ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          )}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <p className="font-semibold">{preview.headingFont}</p>
            <p className="text-sm text-muted-foreground">{preview.bodyFont}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {preview.category && (
              <Badge variant="secondary" className="text-xs">
                {preview.category}
              </Badge>
            )}
            {preview.style && (
              <Badge variant="outline" className="text-xs">
                {preview.style}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <Button
            size="sm"
            onClick={e => {
              e.stopPropagation();
              onSelect();
            }}
            disabled={isLoading}
          >
            Select
          </Button>
        </div>
      </div>
    </Card>
  );
}
