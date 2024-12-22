import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    const apiKey = Deno.env.get('SCREENSHOT_API_KEY');
    if (!apiKey) {
      console.error('Screenshot API key not found in environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing screenshot for URL:', url);
    console.log('API Key exists:', !!apiKey);
    
    // Generate a screenshot using screenshotone.com with additional options
    const screenshotUrl = new URL('https://api.screenshotone.com/take');
    screenshotUrl.searchParams.append('access_key', apiKey);
    screenshotUrl.searchParams.append('url', url);
    screenshotUrl.searchParams.append('viewport_width', '1280');
    screenshotUrl.searchParams.append('viewport_height', '720');
    screenshotUrl.searchParams.append('format', 'jpg');
    screenshotUrl.searchParams.append('block_ads', 'true');
    screenshotUrl.searchParams.append('block_trackers', 'true');
    screenshotUrl.searchParams.append('block_social', 'true');
    screenshotUrl.searchParams.append('timeout', '30');
    
    console.log('Making request to Screenshot API:', screenshotUrl.toString());
    
    const response = await fetch(screenshotUrl.toString());
    console.log('Screenshot API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Screenshot API error:', errorText);
      throw new Error(`Screenshot API error: ${response.status} - ${errorText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    
    console.log('Successfully generated screenshot');

    // Return popup data with the actual screenshot
    const mockPopups = [
      {
        title: "Website Screenshot",
        description: "Captured screenshot of the website",
        cta: "View",
        image: `data:image/jpeg;base64,${base64Image}`,
        backgroundColor: "#FFFFFF",
        textColor: "#000000"
      }
    ];

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: mockPopups
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