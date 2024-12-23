import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmailCampaign } from "@/hooks/useEmailCampaigns";

interface EmailCampaignViewerProps {
  brandId: string;
  campaigns: EmailCampaign[];
  isLoading: boolean;
}

export const EmailCampaignViewer = ({ brandId, campaigns, isLoading }: EmailCampaignViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  if (isLoading) {
    return (
      <Card className="w-full h-48 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading email campaigns...
        </div>
      </Card>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <Card className="w-full h-48 flex items-center justify-center">
        <div className="text-muted-foreground">
          No email campaigns available for this brand
        </div>
      </Card>
    );
  }

  const currentCampaign = campaigns[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : campaigns.length - 1));
    setImageError(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < campaigns.length - 1 ? prev + 1 : 0));
    setImageError(false);
  };

  const handleImageError = () => {
    console.error('Error loading email campaign image:', {
      brandId,
      campaignId: currentCampaign.id,
      imageUrl: currentCampaign.screenshot_url
    });
    setImageError(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-sm text-muted-foreground">
          Campaign {currentIndex + 1} of {campaigns.length}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={campaigns.length <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={campaigns.length <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full rounded-lg overflow-hidden">
          {currentCampaign.screenshot_url && !imageError ? (
            <div className="relative w-full pt-[150%]">
              <img 
                src={currentCampaign.screenshot_url}
                alt={currentCampaign.subject_line || "Email campaign screenshot"}
                className="absolute top-0 left-0 w-full h-full object-contain rounded-lg shadow-lg"
                onError={handleImageError}
                crossOrigin="anonymous"
              />
            </div>
          ) : (
            <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-lg">
              <span className="text-gray-400">Failed to load screenshot</span>
            </div>
          )}
          <div className="mt-4 space-y-2">
            {currentCampaign.subject_line && (
              <h3 className="font-semibold">{currentCampaign.subject_line}</h3>
            )}
            <p className="text-sm text-gray-600">
              Sent on {formatDate(currentCampaign.campaign_date)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};