import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  try {
    const { url } = await req.json()
    
    if (!url) {
      console.error('URL is required but was not provided');
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Launching browser for URL:', url);
    
    const browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    try {
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Wait a bit for popups to appear
      await page.waitForTimeout(5000);
      
      // Look for common popup selectors
      const popupSelectors = [
        '[class*="popup"]',
        '[class*="modal"]',
        '[class*="overlay"]',
        '[id*="popup"]',
        '[id*="modal"]',
        '[role="dialog"]'
      ];
      
      let screenshot = null;
      for (const selector of popupSelectors) {
        const element = await page.$(selector);
        if (element) {
          screenshot = await element.screenshot({
            encoding: 'base64'
          });
          break;
        }
      }
      
      await browser.close();
      
      if (!screenshot) {
        console.log('No popup found on page');
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: {
              title: "No Popup Found",
              description: "No popup was detected on this website",
              cta: "View Details",
              image: "/placeholder.svg",
              backgroundColor: "#FFFFFF",
              textColor: "#000000"
            }
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            title: "Captured Popup",
            description: "Popup captured from website",
            cta: "View Details",
            image: `data:image/png;base64,${screenshot}`,
            backgroundColor: "#FFFFFF",
            textColor: "#000000"
          }
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
      
    } catch (error) {
      console.error('Error during page processing:', error);
      await browser.close();
      throw error;
    }
    
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});