import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

interface StylePresetSelectorProps {
  onSelectPreset: (preset: any) => void;
}

export function StylePresetSelector({ onSelectPreset }: StylePresetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: presets, isLoading: presetsLoading } = trpc.presets.list.useQuery();
  const { data: categories } = trpc.presets.categories.useQuery();
  const { data: searchResults, isLoading: searchLoading } = trpc.presets.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const displayPresets = searchQuery.length > 0 ? searchResults : presets;
  const filteredPresets = selectedCategory
    ? displayPresets?.filter((p) => p.category === selectedCategory)
    : displayPresets;

  const handleSelectPreset = (preset: any) => {
    onSelectPreset(preset);
    toast.success(`Applied "${preset.name}" preset`);
  };

  const isLoading = presetsLoading || searchLoading;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Quick-Apply Style Presets</h3>
        <p className="text-sm text-gray-600">
          Choose from professionally designed presets to instantly customize your template
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search presets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 mb-6">
            <TabsTrigger
              value="all"
              onClick={() => setSelectedCategory(null)}
              className="text-xs sm:text-sm"
            >
              All
            </TabsTrigger>
            {categories?.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">{category.icon}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPresets?.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  onSelect={() => handleSelectPreset(preset)}
                />
              ))}
            </div>
          </TabsContent>

          {categories?.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPresets?.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    onSelect={() => handleSelectPreset(preset)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {filteredPresets?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery ? "No presets found matching your search" : "No presets available"}
          </p>
        </div>
      )}
    </div>
  );
}

interface PresetCardProps {
  preset: any;
  onSelect: () => void;
}

function PresetCard({ preset, onSelect }: PresetCardProps) {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
      {/* Color Preview */}
      <div className="flex gap-2 mb-4 h-12 rounded overflow-hidden">
        <div
          className="flex-1"
          style={{ backgroundColor: preset.coverColor }}
          title="Cover Color"
        />
        <div
          className="flex-1"
          style={{ backgroundColor: preset.accentColor }}
          title="Accent Color"
        />
      </div>

      {/* Preset Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{preset.icon}</span>
          <h4 className="font-semibold text-base">{preset.name}</h4>
        </div>
        <p className="text-xs text-gray-600 line-clamp-2">{preset.description}</p>
      </div>

      {/* Preset Details */}
      <div className="space-y-1 mb-4 text-xs text-gray-700">
        <div>
          <strong>Fonts:</strong> {preset.bodyFont} / {preset.headingFont}
        </div>
        <div>
          <strong>Sizes:</strong> {preset.bodyFontSize}pt / {preset.headingFontSize}pt
        </div>
        <div>
          <strong>Style:</strong> {preset.chapterStyle}
        </div>
      </div>

      {/* Category Badge */}
      <div className="mb-4">
        <Badge variant="outline" className="text-xs capitalize">
          {preset.category}
        </Badge>
      </div>

      {/* Apply Button */}
      <Button onClick={onSelect} className="w-full" size="sm">
        Apply Preset
      </Button>
    </Card>
  );
}
