import { Brand } from "@/data/brands";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExternalLink, Mail, MessageSquare, LayoutTemplate } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FirecrawlService } from "@/utils/FirecrawlService";

interface BrandCardProps {
  brand: Brand;
}

const BrandCard = ({ brand }: BrandCardProps) => {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popupContent, setPopupContent] = useState<string | null>(null);

  const fetchPopup = async () => {
    setIsLoading(true);
    try {
      const result = await FirecrawlService.crawlWebsite(brand.website);
      if (result.success && result.data) {
        setPopupContent(JSON.stringify(result.data, null, 2));
        toast({
          title: "Success",
          description: "Successfully fetched popup content",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch popup content",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching popup:', error);
      toast({
        title: "Error",
        description: "Failed to fetch popup content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{brand.name}</DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
              {brand.smsExamples.map((sms, index) => (
                <img key={index} src={sms} alt="SMS Example" className="w-full rounded-lg shadow" />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Email Examples</h3>
            <div className="grid grid-cols-2 gap-4">
              {brand.emailExamples.map((email, index) => (
                <img key={index} src={email} alt="Email Example" className="w-full rounded-lg shadow" />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Live Popup Content</h3>
            <Button 
              onClick={fetchPopup} 
              disabled={isLoading}
              className="mb-4"
            >
              {isLoading ? "Fetching..." : "Fetch Live Popup"}
            </Button>
            {popupContent && (
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                {popupContent}
              </pre>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrandCard;