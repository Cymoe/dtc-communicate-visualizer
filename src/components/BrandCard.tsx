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
  
  const { data: campaigns, isLoading: isLoadingCampaigns } = useEmailCampaigns(brand.id);

  const handleCardClick = async () => {
    setIsLoading(true);
    try {
      // Format brand name for Milled.com URL (lowercase, remove spaces and special chars)
      const formattedBrandName = brand.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove any non-alphanumeric characters
        .trim();
      
      // Construct the proper Milled.com URL
      const milledUrl = `https://milled.com/search/${formattedBrandName}`;
      console.log('Fetching email campaigns from:', milledUrl);
      
      const result = await FirecrawlService.crawlWebsite(milledUrl);
      
      if (!result.success) {
        console.error('Failed to fetch email campaigns:', 'error' in result ? result.error : 'Unknown error');
        toast({
          title: "Error",
          description: 'error' in result ? result.error : "Failed to fetch email campaigns",
          variant: "destructive"
        });
        return;
      }

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
        console.error('Error saving email campaign:', upsertError);
        toast({
          title: "Error",
          description: "Failed to save email campaign",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Successfully captured email campaign",
      });
    } catch (error) {
      console.error('Error processing email campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to process email campaigns",
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