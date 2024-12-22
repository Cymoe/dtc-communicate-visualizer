import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function takeScreenshot(url: string): Promise<string> {
  const apiKey = Deno.env.get('SCREENSHOT_API_KEY');
  if (!apiKey) {
    throw new Error('Screenshot API key not configured');
  }

  console.log(`Taking screenshot of ${url}`);
  
  const params = new URLSearchParams({
    access_key: apiKey,
    url: url,
    viewport_width: '1280',
    viewport_height: '720',
    format: 'jpg',
    block_ads: 'true',
    block_trackers: 'true',
    delay: '3',
    full_page: 'false',
    timeout: '30',
  });

  const screenshotUrl = `https://api.screenshotone.com/take?${params}`;
  console.log('Requesting screenshot from:', screenshotUrl);

  const response = await fetch(screenshotUrl);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Screenshot API error (${response.status}):`, errorText);
    
    if (errorText.includes('screenshots_limit_reached')) {
      throw new Error('screenshots_limit_reached');
    }
    
    throw new Error(`Screenshot API error: ${response.status} - ${errorText}`);
  }

  const imageBuffer = await response.arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    const { url } = await req.json();
    console.log('Received request for URL:', url);
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const base64Image = await takeScreenshot(url);
    console.log('Screenshot captured successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: [{
          title: "Website Popup",
          description: "Captured popup from the website",
          cta: "View",
          image: `data:image/jpeg;base64,${base64Image}`,
          backgroundColor: "#FFFFFF",
          textColor: "#000000"
        }]
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
      
  } catch (error) {
    console.error('Error processing request:', error);
    
    if (error.message === 'screenshots_limit_reached') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Screenshot limit reached. Please try again later or contact support to increase your limit.'
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
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