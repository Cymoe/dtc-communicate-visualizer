import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
}

async function takeScreenshot(url: string, apiKey: string): Promise<Response> {
  try {
    console.log(`Taking screenshot of ${url}`);
    
    const params = new URLSearchParams({
      access_key: apiKey,
      url: url,
      viewport_width: '1280',
      viewport_height: '720',
      format: 'jpg',
      timeout: '90',  // 90 seconds
      block_ads: 'true',
      block_trackers: 'true',
      delay: '30'     // Changed to 30 milliseconds (maximum allowed)
    });

    const screenshotUrl = `https://api.screenshotone.com/take?${params}`;
    console.log('Requesting screenshot from:', screenshotUrl);

    const response = await fetch(screenshotUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Screenshot API error (${response.status}):`, errorText);
      throw new Error(`Screenshot API error: ${response.status} - ${errorText}`);
    }

    return response;
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    throw error;
  }
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
      console.error('URL is required but was not provided');
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const apiKey = Deno.env.get('SCREENSHOT_API_KEY');
    if (!apiKey) {
      console.error('Screenshot API key not found in environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Starting screenshot capture process');
    const screenshotResponse = await takeScreenshot(url, apiKey);
    const imageBuffer = await screenshotResponse.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    
    console.log('Screenshot captured successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: [{
          title: "Website Screenshot",
          description: "Captured screenshot of the website",
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