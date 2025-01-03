import { Brand } from "@/data/brands";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExternalLink, Mail, MessageSquare, LayoutTemplate } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FirecrawlService } from "@/utils/FirecrawlService";
import { EmailCampaignViewer } from "./email/EmailCampaignViewer";
import { useEmailCampaigns } from "@/hooks/useEmailCampaigns";
import { supabase } from "@/integrations/supabase/client";

interface BrandCardProps {
  brand: Brand;
}

const BrandCard = ({ brand }: BrandCardProps) => {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  
  const { data: campaigns, isLoading: isLoadingCampaigns } = useEmailCampaigns(brand.id);

  const handleCardClick = async () => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    
    setIsLoading(true);
    try {
      // Format brand name for Milled.com URL
      const formattedBrandName = encodeURIComponent(
        brand.name.toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .trim()
      );
      
      // Use Milled.com search URL
      const milledUrl = `https://milled.com/search/${formattedBrandName}`;
      console.log(`[${brand.name}] Attempt ${retryCount + 1}/${MAX_RETRIES} - Fetching from: ${milledUrl}`);

      const result = await FirecrawlService.crawlWebsite(milledUrl);
      
      if (!result.success) {
        throw new Error('error' in result ? result.error : 'Failed to fetch email campaigns');
      }

      // Reset retry count on success
      setRetryCount(0);

      // Save the screenshot as an email campaign
      const { error: upsertError } = await supabase
        .from('email_campaigns')
        .insert({
          brand_id: brand.id,
          screenshot_url: result.data[0].image,
          subject_line: `Latest campaigns from ${brand.name}`,
          campaign_date: new Date().toISOString()
        });

      if (upsertError) {
        throw upsertError;
      }

      toast({
        title: "Success",
        description: "Successfully captured email campaign",
      });
    } catch (error) {
      console.error(`[${brand.name}] Error:`, error);
      
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        toast({
          title: "Retrying...",
          description: `Attempt ${retryCount + 1} of ${MAX_RETRIES}`,
        });
        setTimeout(() => handleCardClick(), 2000); // Retry after 2 seconds
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to process email campaigns after multiple attempts",
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
                crossOrigin="anonymous"
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

      <EmailCampaignViewer 
        brandId={brand.id}
        campaigns={campaigns || []}
        isLoading={isLoadingCampaigns}
      />
    </div>
  );
};

export default BrandCard;