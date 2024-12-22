import { Brand } from "@/data/brands";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExternalLink, Mail, MessageSquare, LayoutTemplate } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FirecrawlService } from "@/utils/FirecrawlService";
import { PopupViewer } from "./popup/PopupViewer";
import { usePopups } from "@/hooks/usePopups";
import { supabase } from "@/integrations/supabase/client";

interface BrandCardProps {
  brand: Brand;
}

const BrandCard = ({ brand }: BrandCardProps) => {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: popups, isLoading: isLoadingPopups } = usePopups(brand.id);

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

      // Store the crawled popup data in Supabase
      const { error: upsertError } = await supabase
        .from('brand_popups')
        .upsert({
          brand_id: brand.id,
          popup_content: result.data
        });

      if (upsertError) {
        console.error('Error storing popup data:', upsertError);
        toast({
          title: "Error",
          description: "Failed to save popup content",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Successfully crawled and saved popup content",
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

  return (
    <div className="space-y-4">
      <Card 
        className="cursor-pointer transition-all duration-300 hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <CardHeader className="space-y-1">
          <div className="w-full h-32 relative">
            <img 
              src={brand.logo} 
              alt={brand.name}
              className="w-full h-full object-contain"
            />
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