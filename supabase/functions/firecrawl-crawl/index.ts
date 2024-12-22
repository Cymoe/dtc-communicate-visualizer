import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import FirecrawlApp from 'npm:@mendable/firecrawl-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY')
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Initializing Firecrawl with API key')
    const firecrawl = new FirecrawlApp({ apiKey })

    console.log('Making crawl request to Firecrawl API for URL:', url)
    const result = await firecrawl.crawlUrl(url, {
      limit: 5,
      scrapeOptions: {
        formats: ['html'],
        timeout: 30000
      }
    })

    console.log('Raw crawl result:', result)

    // Transform the crawled content into our PopupContent format
    const transformedPopups = result.data?.map((item: any, index: number) => ({
      title: `Popup ${index + 1}`,
      description: "Sign up for exclusive offers",
      cta: "Sign Up Now",
      image: "/placeholder.svg",
      backgroundColor: "#FFFFFF",
      textColor: "#000000"
    })) || [];

    // Use default popup if no content was found
    const defaultPopup = {
      title: "Welcome",
      description: "Sign up for exclusive offers",
      cta: "Sign Up Now",
      image: "/placeholder.svg",
      backgroundColor: "#FFFFFF",
      textColor: "#000000"
    };

    const popupContent = transformedPopups.length > 0 ? transformedPopups : [defaultPopup];

    return new Response(
      JSON.stringify({ success: true, data: popupContent }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const isCreditsError = errorMessage.includes('402') || errorMessage.toLowerCase().includes('insufficient credits')
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: isCreditsError 
          ? 'The free tier limit has been reached. Please try with a different website or try again later.'
          : errorMessage
      }),
      { 
        status: isCreditsError ? 402 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})