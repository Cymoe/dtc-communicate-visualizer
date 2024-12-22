import { Brand } from "@/data/brands";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExternalLink, Mail, MessageSquare, LayoutTemplate } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { FirecrawlService } from "@/utils/FirecrawlService";

interface PopupContent {
  title: string;
  description: string;
  cta: string;
  image: string;
  backgroundColor: string;
  textColor: string;
}

interface BrandPopup {
  popup_content: PopupContent;
}

interface BrandCardProps {
  brand: Brand;
}

const BrandCard = ({ brand }: BrandCardProps) => {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: popupData, isLoading: isLoadingPopup, error } = useQuery({
    queryKey: ['brandPopup', brand.id],
    queryFn: async () => {
      console.log('Fetching popup data for brand:', brand.id);
      const { data, error } = await supabase
        .from('brand_popups')
        .select('popup_content')
        .eq('brand_id', brand.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching popup data:', error);
        throw error;
      }

      if (!data) {
        console.log('No popup data found for brand:', brand.id);
        return null;
      }

      console.log('Retrieved popup data:', data);
      return data as BrandPopup;
    }
  });

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

      setShowPopup(true);
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

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
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

      {/* Brand Website Popup */}
      {showPopup && popupData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleClosePopup}
        >
          <div 
            className="relative max-w-[500px] mx-4 animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: popupData.popup_content.backgroundColor,
              color: popupData.popup_content.textColor,
            }}
          >
            {/* Close button */}
            <button 
              onClick={handleClosePopup}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-opacity-20 hover:bg-opacity-30 transition-all"
              style={{
                backgroundColor: popupData.popup_content.textColor,
                color: popupData.popup_content.backgroundColor
              }}
            >
              ×
            </button>

            <div className="p-8">
              <img 
                src={popupData.popup_content.image} 
                alt="Popup visual" 
                className="w-full h-48 object-contain mb-6"
              />
              <h4 className="text-3xl font-bold mb-4 text-center">
                {popupData.popup_content.title}
              </h4>
              <p className="text-lg mb-6 text-center leading-relaxed">
                {popupData.popup_content.description}
              </p>
              <div className="flex justify-center">
                <button 
                  className="px-8 py-3 rounded-full text-lg font-semibold transition-transform hover:scale-105"
                  style={{
                    backgroundColor: popupData.popup_content.textColor,
                    color: popupData.popup_content.backgroundColor
                  }}
                >
                  {popupData.popup_content.cta}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BrandCard;