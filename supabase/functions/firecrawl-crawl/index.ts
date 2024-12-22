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

    console.log('Processing screenshot for URL:', url);
    
    // Generate a base64 screenshot using a third-party service
    const screenshotUrl = `https://api.screenshotone.com/take?access_key=XS76KAMN3R&url=${encodeURIComponent(url)}&full_page=false&viewport_width=1280&viewport_height=720&format=jpg&block_ads=true&block_trackers=true&block_social=true`;
    
    const response = await fetch(screenshotUrl);
    if (!response.ok) {
      throw new Error(`Failed to capture screenshot: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))}`;

    // Return mock popup data with the actual screenshot
    const mockPopups = [
      {
        title: "Website Screenshot",
        description: "Captured screenshot of the website",
        cta: "View",
        image: base64Image,
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