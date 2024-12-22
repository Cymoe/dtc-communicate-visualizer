import { Brand } from "@/data/brands";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExternalLink, Mail, MessageSquare, LayoutTemplate } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

  const { data: popupData, isLoading, error } = useQuery({
    queryKey: ['brandPopup', brand.id],
    queryFn: async () => {
      console.log('Fetching popup data for brand:', brand.id);
      const { data, error } = await supabase
        .from('brand_popups')
        .select('popup_content')
        .eq('brand_id', brand.id)
        .single();

      if (error) {
        console.error('Error fetching popup data:', error);
        throw error;
      }

      // First assert as unknown, then as our expected type
      const rawData = data as unknown;
      const typedData = rawData as BrandPopup;
      
      console.log('Retrieved popup data:', typedData);
      return typedData;
    }
  });

  return (
    <Dialog>
      <DialogTrigger>
        <Card 
          className="cursor-pointer transition-all duration-300 hover:shadow-lg"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardHeader className="space-y-1">
            <div className="w-full h-32 relative">
              <img 
                src={brand.logo} 
                alt={brand.name}
                className="w-full h-full object-contain"
              />
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
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{brand.name}</DialogTitle>
          <DialogDescription>View details and marketing materials for {brand.name}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <section>
            <h3 className="text-lg font-semibold mb-2">Website</h3>
            <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Visit Website
            </a>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-2">SMS Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brand.smsExamples.map((sms, index) => (
                <img key={index} src={sms} alt="SMS Example" className="w-full rounded-lg shadow" />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Email Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brand.emailExamples.map((email, index) => (
                <img key={index} src={email} alt="Email Example" className="w-full rounded-lg shadow" />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Popup Example</h3>
            {isLoading && (
              <div className="text-center py-4">
                <p>Loading popup content...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Failed to load popup content. Please try again later.</p>
              </div>
            )}

            {popupData && (
              <div 
                className="rounded-lg p-6 shadow-lg"
                style={{
                  backgroundColor: popupData.popup_content.backgroundColor,
                  color: popupData.popup_content.textColor
                }}
              >
                <div className="max-w-md mx-auto">
                  <img 
                    src={popupData.popup_content.image} 
                    alt="Popup visual" 
                    className="w-full h-48 object-contain mb-4"
                  />
                  <h4 className="text-2xl font-bold mb-2">
                    {popupData.popup_content.title}
                  </h4>
                  <p className="text-lg mb-4">
                    {popupData.popup_content.description}
                  </p>
                  <button 
                    className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    {popupData.popup_content.cta}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrandCard;