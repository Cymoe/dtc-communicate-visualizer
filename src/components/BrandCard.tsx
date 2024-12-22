import { Brand } from "@/data/brands";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExternalLink, Mail, MessageSquare, LayoutTemplate } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FirecrawlService } from "@/utils/FirecrawlService";
import { PopupViewer } from "./popup/PopupViewer";
import { usePopups } from "@/hooks/usePopups";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface BrandCardProps {
  brand: Brand;
}

const MAX_SAVE_RETRIES = 3;
const SAVE_RETRY_DELAY = 2000;

const BrandCard = ({ brand }: BrandCardProps) => {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const { data: popups, isLoading: isLoadingPopups } = usePopups(brand.id);

  const savePopupContent = async (popupContent: Json[], retryCount = 0): Promise<boolean> => {
    try {
      const { error: upsertError } = await supabase
        .from('brand_popups')
        .upsert({
          brand_id: brand.id,
          popup_content: popupContent,
          updated_at: new Date().toISOString()
        });

      if (upsertError) {
        console.error(`Error storing popup data (attempt ${retryCount + 1}/${MAX_SAVE_RETRIES}):`, upsertError);
        
        if (retryCount < MAX_SAVE_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, SAVE_RETRY_DELAY));
          return savePopupContent(popupContent, retryCount + 1);
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error in savePopupContent (attempt ${retryCount + 1}/${MAX_SAVE_RETRIES}):`, error);
      
      if (retryCount < MAX_SAVE_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, SAVE_RETRY_DELAY));
        return savePopupContent(popupContent, retryCount + 1);
      }
      return false;
    }
  };

  const handleCardClick = async () => {
    setIsLoading(true);
    try {
      console.log('Crawling website:', brand.website);
      const result = await FirecrawlService.crawlWebsite(brand.website);
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch popup content",
          variant: "destructive"
        });
        return;
      }

      const popupContent = (Array.isArray(result.data) ? result.data : [result.data]) as unknown as Json[];

      console.log('Saving popup content:', popupContent);

      const savedSuccessfully = await savePopupContent(popupContent);

      if (!savedSuccessfully) {
        toast({
          title: "Error",
          description: "Failed to save popup content after multiple attempts",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `Successfully crawled and saved ${popupContent.length} popups`,
      });
    } catch (error) {
      console.error('Error crawling website:', error);
      toast({
        title: "Error",
        description: "Failed to fetch popup content",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    console.error(`Failed to load image for brand: ${brand.name}`);
    setImageError(true);
  };

  return (
    <div className="space-y-4">
      <Card 
        className="cursor-pointer transition-all duration-300 hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <CardHeader className="space-y-1">
          <div className="w-full h-32 relative bg-white flex items-center justify-center p-4">
            {!imageError ? (
              <img 
                src={brand.logo} 
                alt={`${brand.name} logo`}
                className="w-full h-full object-contain"
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="text-gray-400 flex items-center justify-center h-full">
                {brand.name}
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold text-lg mb-2">{brand.name}</h3>
          <div className="flex gap-2 justify-center">
            <ExternalLink className="w-5 h-5 text-blue-600" />
            <Mail className="w-5 h-5 text-blue-600" />
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <LayoutTemplate className="w-5 h-5 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <PopupViewer 
        brandId={brand.id}
        popups={popups || []}
        isLoading={isLoadingPopups}
      />
    </div>
  );
};

export default BrandCard;
