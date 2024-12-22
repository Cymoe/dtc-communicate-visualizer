import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Processing URL:', url);

    // Common selectors for popups and modals
    const popupSelectors = '[role="dialog"],.modal,.popup,.overlay,[class*="modal"],[class*="popup"],[class*="dialog"],[id*="modal"],[id*="popup"],[id*="dialog"]';

    // Construct the Screenshot API URL with increased timeouts
    const screenshotApiUrl = new URL('https://api.screenshotone.com/take');
    screenshotApiUrl.searchParams.append('access_key', Deno.env.get('SCREENSHOT_API_KEY') || '');
    screenshotApiUrl.searchParams.append('url', url);
    screenshotApiUrl.searchParams.append('viewport_width', '1280');
    screenshotApiUrl.searchParams.append('viewport_height', '800');
    screenshotApiUrl.searchParams.append('device_scale_factor', '1');
    screenshotApiUrl.searchParams.append('format', 'png');
    screenshotApiUrl.searchParams.append('block_ads', 'true');
    screenshotApiUrl.searchParams.append('block_trackers', 'true');
    screenshotApiUrl.searchParams.append('block_analytics', 'true');
    screenshotApiUrl.searchParams.append('cache_ttl', '0');
    screenshotApiUrl.searchParams.append('full_page', 'false');
    screenshotApiUrl.searchParams.append('timeout', '60'); // Increased from 30 to 60 seconds
    screenshotApiUrl.searchParams.append('navigation_timeout', '60'); // Added navigation timeout
    screenshotApiUrl.searchParams.append('selector', popupSelectors);
    screenshotApiUrl.searchParams.append('wait_for_selector', popupSelectors);

    console.log('Making request to Screenshot API...');
    const response = await fetch(screenshotApiUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Screenshot API error:', response.status, errorText);
      
      // Parse the error message for better client feedback
      let errorMessage = 'Failed to capture screenshot';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error_message) {
          errorMessage = errorJson.error_message;
        }
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      
      throw new Error(`Screenshot API error: ${response.status} - ${errorMessage}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    // Mock popup data structure
    const popupData = {
      title: "Newsletter Signup",
      description: "Join our mailing list for exclusive offers",
      cta: "Sign Up Now",
      image: `data:image/png;base64,${base64Image}`,
      backgroundColor: "#ffffff",
      textColor: "#000000"
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: [popupData]
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});