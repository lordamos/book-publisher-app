import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Lightbulb, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface RecommendedPresetsPanelProps {
  bookId: number;
  onSelectPreset: (presetId: string) => void;
}

export function RecommendedPresetsPanel({ bookId, onSelectPreset }: RecommendedPresetsPanelProps) {
  const { data: recommendations, isLoading } = trpc.recommendations.forBook.useQuery({
    bookId,
  });

  const handleSelectPreset = (presetId: string, presetName: string) => {
    onSelectPreset(presetId);
    toast.success(`Applied "${presetName}" preset based on your book's content`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!recommendations || recommendations.recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No recommendations available yet. Add more content to your book.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-lg">Recommended for You</h3>
        </div>
        <p className="text-sm text-gray-600">
          Based on your book's genre ({recommendations.genre}) and content analysis
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.recommendations.map((rec, index) => (
          <RecommendationCard
            key={rec.presetId}
            recommendation={rec}
            rank={index + 1}
            onSelect={() => handleSelectPreset(rec.presetId, rec.presetName)}
          />
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> These recommendations are based on your book's genre and writing
          tone. You can customize any preset further using the template customizer.
        </p>
      </div>
    </div>
  );
}

interface RecommendationCardProps {
  recommendation: any;
  rank: number;
  onSelect: () => void;
}

function RecommendationCard({ recommendation, rank, onSelect }: RecommendationCardProps) {
  const confidenceColor =
    recommendation.confidence >= 80
      ? "text-green-600"
      : recommendation.confidence >= 60
        ? "text-amber-600"
        : "text-gray-600";

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-semibold text-sm">
            {rank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{recommendation.presetIcon}</span>
              <h4 className="font-semibold text-base">{recommendation.presetName}</h4>
            </div>
            <p className="text-xs text-gray-600 mt-1">{recommendation.explanation}</p>
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Match Score</span>
          <span className={`text-sm font-semibold ${confidenceColor}`}>
            {recommendation.confidence}%
          </span>
        </div>
        <Progress value={recommendation.confidence} className="h-2" />
      </div>

      {/* Reasons */}
      {recommendation.reasons.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-medium text-gray-700">Why this preset:</p>
          <div className="flex flex-wrap gap-2">
            {recommendation.reasons.map((reason: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {reason}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Apply Button */}
      <Button onClick={onSelect} className="w-full" size="sm">
        <TrendingUp className="w-4 h-4 mr-2" />
        Apply This Preset
      </Button>
    </Card>
  );
}
