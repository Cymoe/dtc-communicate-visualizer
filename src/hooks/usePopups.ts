import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PopupContent } from "@/types/popup";
import { Json } from "@/integrations/supabase/types";

// Type guard to check if a value is a PopupContent
function isPopupContent(value: Json): value is PopupContent {
  if (typeof value !== 'object' || value === null) return false;
  
  const popup = value as Record<string, unknown>;
  return (
    typeof popup.title === 'string' &&
    typeof popup.description === 'string' &&
    typeof popup.cta === 'string' &&
    typeof popup.image === 'string' &&
    typeof popup.backgroundColor === 'string' &&
    typeof popup.textColor === 'string'
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
        .single();

      if (error) {
        console.error('Error fetching popups:', error);
        throw error;
      }

      if (!data || !data.popup_content) {
        console.log('No popups found for brand:', brandId);
        return [];
      }

      // Ensure popup_content is an array
      const popupArray = Array.isArray(data.popup_content) ? data.popup_content : [data.popup_content];

      // Validate each popup using the type guard
      const validPopups = popupArray.filter(isPopupContent);

      if (validPopups.length < popupArray.length) {
        console.log('Some popups were invalid and filtered out');
      }

      console.log('Retrieved valid popups:', validPopups);
      return validPopups;
    }
  });
};