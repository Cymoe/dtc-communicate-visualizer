import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import FirecrawlApp from 'npm:@mendable/firecrawl-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
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
      limit: 1, // Reduced from 100 to 1 to minimize credit usage
      scrapeOptions: {
        formats: ['html'],
        selectors: [
          // Common popup selectors
          '[class*="popup"]',
          '[class*="modal"]',
          '[class*="dialog"]',
          '[class*="overlay"]',
          '[id*="popup"]',
          '[id*="modal"]',
          '[role="dialog"]',
          // Common newsletter/subscription form selectors
          '[class*="newsletter"]',
          '[class*="subscribe"]',
          '[class*="sign-up"]',
          // Common exit intent popup selectors
          '[class*="exit"]',
          '[class*="intent"]'
        ],
        // Wait for dynamic content to load
        waitForSelector: '[class*="popup"], [class*="modal"], [class*="dialog"]',
        waitTime: 5000 // Wait up to 5 seconds for popups to appear
      }
    })

    console.log('Crawl result:', result)
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    
    // Check if error is related to insufficient credits
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