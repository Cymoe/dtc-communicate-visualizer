import { Brand } from "@/data/brands";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExternalLink, Mail, MessageSquare, LayoutTemplate } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FirecrawlService } from "@/utils/FirecrawlService";

interface BrandCardProps {
  brand: Brand;
}

interface CrawlResult {
  status: string;
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: string;
  data: any[];
}

const BrandCard = ({ brand }: BrandCardProps) => {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);

  const fetchPopup = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching popup content for:', brand.website);
      const result = await FirecrawlService.crawlWebsite(brand.website);
      
      if (result.success && result.data) {
        console.log('Successfully fetched popup content:', result.data);
        setCrawlResult(result.data);
        toast({
          title: "Success",
          description: "Successfully fetched popup content",
        });
      } else {
        console.error('Failed to fetch popup:', result.error);
        toast({
          title: "Limited Access",
          description: result.error || "Failed to fetch popup content. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching popup:', error);
      toast({
        title: "Error",
        description: "Failed to fetch popup content. Please try again later.",
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
            {crawlResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">Status</p>
                    <p>{crawlResult.status}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">Pages Crawled</p>
                    <p>{crawlResult.completed} / {crawlResult.total}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">Credits Used</p>
                    <p>{crawlResult.creditsUsed}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">Expires At</p>
                    <p>{new Date(crawlResult.expiresAt).toLocaleString()}</p>
                  </div>
                </div>
                {crawlResult.data && crawlResult.data.length > 0 ? (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Crawled Data:</h4>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                      {JSON.stringify(crawlResult.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No popup content was found during the crawl.</p>
                )}
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrandCard;