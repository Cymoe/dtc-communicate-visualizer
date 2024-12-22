import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
}

async function takeScreenshot(url: string, apiKey: string): Promise<Response> {
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

  const response = await fetch(screenshotUrl, {
    method: 'GET',
    headers: {
      'Accept': 'image/jpeg',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Screenshot API error (${response.status}):`, errorText);
    throw new Error(`Screenshot API error: ${response.status} - ${errorText}`);
  }

  return response;
}

serve(async (req) => {
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

    const apiKey = Deno.env.get('SCREENSHOT_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const screenshotResponse = await takeScreenshot(url, apiKey);
    const imageBuffer = await screenshotResponse.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    
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
    
    // Check if the error is related to screenshot limits
    if (error.message?.includes('screenshots_limit_reached')) {
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