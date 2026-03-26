import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TemplateCustomizer } from "./TemplateCustomizer";
import { PresetPreviewRenderer } from "./PresetPreviewRenderer";
import { Eye, Edit3 } from "lucide-react";

interface PresetPreviewPanelProps {
  initialPreset?: any;
  bookContent?: any;
  onApplyPreset?: (preset: any) => void;
}

export function PresetPreviewPanel({
  initialPreset,
  bookContent,
  onApplyPreset,
}: PresetPreviewPanelProps) {
  const [preset, setPreset] = useState(initialPreset || {});
  const [selectedPageType, setSelectedPageType] = useState<"cover" | "chapter" | "body">("body");
  const [viewMode, setViewMode] = useState<"preview" | "editor" | "split">("split");

  const handlePresetChange = (updatedPreset: any) => {
    setPreset(updatedPreset);
  };

  const handleApply = () => {
    onApplyPreset?.(preset);
  };

  return (
    <div className="space-y-4">
      {/* View Mode Selector */}
      <div className="flex items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "preview" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("preview")}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Only
          </Button>
          <Button
            variant={viewMode === "editor" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("editor")}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Editor Only
          </Button>
          <Button
            variant={viewMode === "split" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("split")}
          >
            Split View
          </Button>
        </div>

        <Button onClick={handleApply} className="bg-green-600 hover:bg-green-700">
          Apply Preset
        </Button>
      </div>

      {/* Content Area */}
      {viewMode === "preview" && (
        <div>
          <PresetPreviewRenderer
            preset={preset}
            bookContent={bookContent}
            selectedPageType={selectedPageType}
            onPageTypeChange={setSelectedPageType}
          />
        </div>
      )}

      {viewMode === "editor" && (
        <div>
          <TemplateCustomizer
            isOpen={true}
            onOpenChange={() => {}}
            initialTemplate={preset}
            onSave={handlePresetChange}
          />
        </div>
      )}

      {viewMode === "split" && (
        <div className="grid grid-cols-2 gap-4">
          {/* Editor Panel */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Customize</h3>
            <TemplateCustomizer
              isOpen={true}
              onOpenChange={() => {}}
              initialTemplate={preset}
              onSave={handlePresetChange}
            />
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Live Preview</h3>
            <PresetPreviewRenderer
              preset={preset}
              bookContent={bookContent}
              selectedPageType={selectedPageType}
              onPageTypeChange={setSelectedPageType}
            />
          </div>
        </div>
      )}
    </div>
  );
}
