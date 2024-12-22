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

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export class FirecrawlService {
  static async crawlWebsite(url: string): Promise<{ success: boolean; error?: string; data?: any[] }> {
    try {
      console.log('Making screenshot request for URL:', url);
      
      let lastError: Error | null = null;
      
      // Implement retry logic
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const response = await fetch('https://vbodnckdrvwjoryqchxa.supabase.co/functions/v1/firecrawl-crawl', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2RuY2tkcnZ3am9yeXFjaHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NjMwMTEsImV4cCI6MjA1MDQzOTAxMX0.Rco1GbkEHpx4_d6ycu_trmV7nVLtaxIKeO7aQtOQ0YY`
            },
            body: JSON.stringify({ url })
          });

          if (!response.ok) {
            const text = await response.text();
            console.error(`Failed to capture screenshot (attempt ${attempt}/${MAX_RETRIES}), status:`, response.status);
            console.error('Response text:', text);
            
            if (attempt === MAX_RETRIES) {
              return { 
                success: false, 
                error: `Failed to capture screenshot after ${MAX_RETRIES} attempts: ${text}` 
              };
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          }

          const result = await response.json();
          
          if (!result.success) {
            console.error(`Screenshot capture failed (attempt ${attempt}/${MAX_RETRIES}):`, result.error);
            
            if (attempt === MAX_RETRIES) {
              return { 
                success: false, 
                error: result.error || 'Failed to capture screenshot' 
              };
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          }

          console.log('Screenshot capture successful');
          return { 
            success: true,
            data: result.data
          };
        } catch (error) {
          console.error(`Error during screenshot capture (attempt ${attempt}/${MAX_RETRIES}):`, error);
          lastError = error instanceof Error ? error : new Error('Unknown error');
          
          if (attempt === MAX_RETRIES) {
            break;
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }

      return { 
        success: false, 
        error: lastError?.message || 'Failed to capture screenshot after multiple attempts' 
      };
    } catch (error) {
      console.error('Fatal error during screenshot capture:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to capture screenshot' 
      };
    }
  }
}