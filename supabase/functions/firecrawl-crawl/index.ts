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

    console.log('Processing mock data for URL:', url);
    
    // Return mock popup data
    const mockPopups = [
      {
        title: "Welcome Offer",
        description: "Get 15% off your first purchase when you sign up for our newsletter!",
        cta: "Sign Up Now",
        image: "/placeholder.svg",
        backgroundColor: "#FFFFFF",
        textColor: "#000000"
      },
      {
        title: "Limited Time Sale",
        description: "Shop our biggest sale of the season - up to 50% off!",
        cta: "Shop Now",
        image: "/placeholder.svg",
        backgroundColor: "#F8F8F8",
        textColor: "#333333"
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