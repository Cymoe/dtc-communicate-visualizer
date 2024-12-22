import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PopupContent } from "@/types/popup";

export const usePopups = (brandId: string) => {
  return useQuery({
    queryKey: ['brandPopups', brandId],
    queryFn: async () => {
      console.log('Fetching popups for brand:', brandId);
      const { data, error } = await supabase
        .from('brand_popups')
        .select('popup_content')
        .eq('brand_id', brandId);

      if (error) {
        console.error('Error fetching popups:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No popups found for brand:', brandId);
        return [];
      }

      // Validate and transform the data
      const validPopups = data
        .map(item => {
          const content = item.popup_content as unknown as PopupContent;
          if (!content ||
              typeof content.title !== 'string' ||
              typeof content.description !== 'string' ||
              typeof content.cta !== 'string' ||
              typeof content.image !== 'string' ||
              typeof content.backgroundColor !== 'string' ||
              typeof content.textColor !== 'string') {
            console.error('Invalid popup content:', content);
            return null;
          }
          return content;
        })
        .filter((popup): popup is PopupContent => popup !== null);

      console.log('Retrieved valid popups:', validPopups);
      return validPopups;
    }
  });
};