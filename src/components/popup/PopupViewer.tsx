import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PopupContent } from "@/types/popup";

interface PopupViewerProps {
  brandId: string;
  popups: PopupContent[];
  isLoading: boolean;
}

export const PopupViewer = ({ brandId, popups, isLoading }: PopupViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  if (isLoading) {
    return (
      <Card className="w-full h-48 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading popups...
        </div>
      </Card>
    );
  }

  if (!popups || popups.length === 0) {
    return (
      <Card className="w-full h-48 flex items-center justify-center">
        <div className="text-muted-foreground">
          No popups available for this brand
        </div>
      </Card>
    );
  }

  const currentPopup = popups[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : popups.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < popups.length - 1 ? prev + 1 : 0));
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-sm text-muted-foreground">
          Popup {currentIndex + 1} of {popups.length}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={popups.length <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={popups.length <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="p-6 rounded-lg">
          {currentPopup.image ? (
            <img 
              src={currentPopup.image} 
              alt="Popup screenshot" 
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-lg">
              <span className="text-gray-400">No screenshot available</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};