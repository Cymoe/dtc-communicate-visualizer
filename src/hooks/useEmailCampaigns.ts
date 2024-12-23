import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EmailCampaign {
  id: string;
  brand_id: string;
  campaign_date: string;
  subject_line: string | null;
  screenshot_url: string;
  created_at: string;
}

export const useEmailCampaigns = (brandId: string) => {
  return useQuery({
    queryKey: ['emailCampaigns', brandId],
    queryFn: async () => {
      console.log('Fetching email campaigns for brand:', brandId);
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('brand_id', brandId)
        .order('campaign_date', { ascending: false });

      if (error) {
        console.error('Error fetching email campaigns:', error);
        throw error;
      }

      console.log('Retrieved email campaigns:', data);
      return data as EmailCampaign[];
    }
  });
};