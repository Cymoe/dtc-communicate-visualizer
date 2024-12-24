import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('Processing URL:', url)

    const screenshotApiKey = Deno.env.get('SCREENSHOT_API_KEY')
    if (!screenshotApiKey) {
      throw new Error('Screenshot API key not configured')
    }

    // Configure screenshot API parameters
    const params = new URLSearchParams({
      url: url,
      access_key: screenshotApiKey,
      full_page: 'true',
      format: 'jpeg',
      block_ads: 'true',
      block_cookie_banners: 'true',
      viewport_width: '1920',
      viewport_height: '1080',
      wait_for: '.email-content', // Wait for Milled.com's email content to load
      timeout: '30'
    })

    console.log('Making screenshot request to API:', url)
    
    const response = await fetch(`https://api.screenshotone.com/take?${params}`)
    if (!response.ok) {
      console.error('Screenshot API error:', await response.text())
      throw new Error('Failed to capture screenshot')
    }

    const result = await response.json()
    console.log('Screenshot captured successfully:', result)

    return new Response(
      JSON.stringify({
        success: true,
        data: [{
          title: 'Milled.com Email Campaign',
          image: result.url || result.image,
          backgroundColor: '#ffffff',
          textColor: '#000000'
        }]
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})