import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PopupContent } from "@/types/popup";
import { Json } from "@/integrations/supabase/types";

// Type guard to check if a value is a PopupContent
function isPopupContent(value: Json): value is PopupContent {
  if (typeof value !== 'object' || value === null) return false;
  
  const popup = value as Record<string, unknown>;
  
  // Allow partial popup data as long as we have at least an image
  return (
    typeof popup.image === 'string' &&
    (!popup.title || typeof popup.title === 'string') &&
    (!popup.description || typeof popup.description === 'string') &&
    (!popup.cta || typeof popup.cta === 'string') &&
    (!popup.backgroundColor || typeof popup.backgroundColor === 'string') &&
    (!popup.textColor || typeof popup.textColor === 'string')
  );
}

export const usePopups = (brandId: string) => {
  return useQuery({
    queryKey: ['brandPopups', brandId],
    queryFn: async () => {
      console.log('Fetching popups for brand:', brandId);
      const { data, error } = await supabase
        .from('brand_popups')
        .select('popup_content')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching popups:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No popups found for brand:', brandId);
        return [];
      }

      const popupContent = data[0].popup_content;
      const popupArray = Array.isArray(popupContent) ? popupContent : [popupContent];

      const validPopups = popupArray.filter(isPopupContent);

      if (validPopups.length < popupArray.length) {
        console.log('Some popups were invalid and filtered out');
        console.log('Invalid popups:', popupArray.filter(p => !isPopupContent(p)));
      }

      console.log('Retrieved valid popups:', validPopups);
      return validPopups as PopupContent[];
    }
  });
};