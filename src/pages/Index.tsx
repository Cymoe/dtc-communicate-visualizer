import { useState } from "react";
import BrandCard from "@/components/BrandCard";
import SearchBar from "@/components/SearchBar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/data/brands";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FirecrawlService } from "@/utils/FirecrawlService";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [isCrawlingAll, setIsCrawlingAll] = useState(false);
  
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*');
      
      if (error) {
        console.error('Error fetching brands:', error);
        throw error;
      }
      
      return data as Brand[];
    }
  });

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCrawlAll = async () => {
    setIsCrawlingAll(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Process brands in parallel with a limit of 3 concurrent requests
      const batchSize = 3;
      for (let i = 0; i < filteredBrands.length; i += batchSize) {
        const batch = filteredBrands.slice(i, i + batchSize);
        const promises = batch.map(async (brand) => {
          try {
            console.log(`Starting crawl for ${brand.name}`);
            const result = await FirecrawlService.crawlWebsite(brand.website);
            
            if (!result.success) {
              console.error(`Failed to crawl ${brand.name}:`, 'error' in result ? result.error : 'Unknown error');
              failCount++;
              return;
            }

            const popupContent = (Array.isArray(result.data) ? result.data : [result.data]);
            
            const { error: upsertError } = await supabase
              .from('brand_popups')
              .upsert({
                brand_id: brand.id,
                popup_content: popupContent,
                updated_at: new Date().toISOString()
              });

            if (upsertError) {
              console.error(`Failed to save popups for ${brand.name}:`, upsertError);
              failCount++;
              return;
            }

            successCount++;
            console.log(`Successfully processed ${brand.name}`);
          } catch (error) {
            console.error(`Error processing ${brand.name}:`, error);
            failCount++;
          }
        });

        await Promise.all(promises);
      }

      toast({
        title: "Crawl Complete",
        description: `Successfully processed ${successCount} brands. Failed: ${failCount}`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error in crawl all operation:', error);
      toast({
        title: "Error",
        description: "Failed to complete the crawl operation",
        variant: "destructive",
      });
    } finally {
      setIsCrawlingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">DTC Brand Database</h1>
          <p className="text-lg text-gray-600 mb-6">Explore marketing materials from top DTC brands</p>
          <Button 
            onClick={handleCrawlAll}
            disabled={isCrawlingAll}
            className="mb-6"
          >
            {isCrawlingAll ? "Processing All Brands..." : "Crawl All Brands"}
          </Button>
        </div>
        
        <div className="mb-8 max-w-md mx-auto">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map(brand => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;