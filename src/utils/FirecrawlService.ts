interface ErrorResponse {
  success: false;
  error: string;
}

interface CrawlStatusResponse {
  success: true;
  data: Array<{
    title: string;
    description: string;
    cta: string;
    image: string;
    backgroundColor: string;
    textColor: string;
  }>;
}

type CrawlResponse = CrawlStatusResponse | ErrorResponse;

export class FirecrawlService {
  static async crawlWebsite(url: string): Promise<CrawlResponse> {
    try {
      console.log('Making screenshot request for URL:', url);
      
      const response = await fetch('https://vbodnckdrvwjoryqchxa.supabase.co/functions/v1/firecrawl-crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2RuY2tkcnZ3am9yeXFjaHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NjMwMTEsImV4cCI6MjA1MDQzOTAxMX0.Rco1GbkEHpx4_d6ycu_trmV7nVLtaxIKeO7aQtOQ0YY`
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Screenshot API error response:', errorText);
        return { 
          success: false, 
          error: `Failed to capture screenshot: ${errorText}` 
        };
      }

      const result = await response.json();
      console.log('Screenshot API response:', {
        success: result.success,
        dataLength: result.data ? result.data.length : 0,
        firstImage: result.data?.[0]?.image ? `${result.data[0].image.substring(0, 50)}...` : 'No image'
      });
      
      if (!result.success) {
        console.error('Screenshot capture failed:', result.error);
        return { 
          success: false, 
          error: result.error || 'Failed to capture screenshot' 
        };
      }

      // Ensure the image data is properly formatted
      if (result.data && Array.isArray(result.data)) {
        result.data = result.data.map(popup => ({
          ...popup,
          image: popup.image.startsWith('data:image/') ? popup.image : `data:image/jpeg;base64,${popup.image}`
        }));
      }

      return result as CrawlResponse;
    } catch (error) {
      console.error('Error during screenshot capture:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to capture screenshot' 
      };
    }
  }
}