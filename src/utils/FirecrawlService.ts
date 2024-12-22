interface ErrorResponse {
  success: false;
  error: string;
}

interface CrawlStatusResponse {
  success: true;
  status: string;
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: string;
  data: any[];
}

type CrawlResponse = CrawlStatusResponse | ErrorResponse;

export class FirecrawlService {
  private static firecrawlApp: any = null;

  static async crawlWebsite(url: string): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      console.log('Making crawl request through Edge Function for URL:', url);
      
      const response = await fetch('https://vbodnckdrvwjoryqchxa.supabase.co/functions/v1/firecrawl-crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2RuY2tkcnZ3am9yeXFjaHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NjMwMTEsImV4cCI6MjA1MDQzOTAxMX0.Rco1GbkEHpx4_d6ycu_trmV7nVLtaxIKeO7aQtOQ0YY`
        },
        body: JSON.stringify({ 
          url,
          selectors: [
            // Common popup selectors
            '[class*="popup"]',
            '[class*="modal"]',
            '[class*="overlay"]',
            '[id*="popup"]',
            '[id*="modal"]',
            '[role="dialog"]',
            // Newsletter specific selectors
            '[class*="newsletter"]',
            '[id*="newsletter"]',
            // Exit intent popups
            '[class*="exit"]',
            '[class*="intent"]'
          ]
        })
      });

      if (!response.ok) {
        console.error('Failed to crawl website, status:', response.status);
        const text = await response.text();
        console.error('Response text:', text);
        return { 
          success: false, 
          error: `Failed to crawl website: ${response.statusText}` 
        };
      }

      const result = await response.json();
      
      if (!result.success) {
        console.error('Crawl failed:', result.error);
        return { 
          success: false, 
          error: result.error || 'Failed to crawl website' 
        };
      }

      console.log('Crawl successful:', result);
      
      // Process the crawled data to extract popup content
      const popupContent = {
        title: result.data.title || "Welcome",
        description: result.data.description || "Join our newsletter",
        cta: result.data.cta || "Sign Up",
        image: result.data.image || "/placeholder.svg",
        backgroundColor: result.data.backgroundColor || "#FFFFFF",
        textColor: result.data.textColor || "#000000"
      };

      return { 
        success: true,
        data: popupContent
      };
    } catch (error) {
      console.error('Error during crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to crawl website' 
      };
    }
  }
}