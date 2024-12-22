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
    const { url, selectors } = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Making request to Firecrawl API for URL:', url)
    
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY is not set')
      throw new Error('FIRECRAWL_API_KEY is not set')
    }

    console.log('Preparing request to Firecrawl API...')
    const requestBody = JSON.stringify({
      url,
      selectors: selectors || [
        '[class*="popup"]',
        '[class*="modal"]',
        '[class*="overlay"]',
        '[id*="popup"]',
        '[id*="modal"]',
        '[role="dialog"]',
        '[class*="newsletter"]',
        '[id*="newsletter"]',
        '[class*="exit"]',
        '[class*="intent"]'
      ]
    })

    console.log('Request body:', requestBody)

    const response = await fetch('https://api.firecrawl.co/crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlApiKey}`
      },
      body: requestBody
    })

    console.log('Firecrawl API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Firecrawl API error response:', errorText)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Firecrawl API error: ${response.status} - ${errorText}` 
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const result = await response.json()
    console.log('Successfully crawled website:', url)
    console.log('Firecrawl API response:', JSON.stringify(result))

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error processing request:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    console.error('Error details:', errorMessage)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})