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

    const params = new URLSearchParams({
      url: url,
      access_key: screenshotApiKey,
      full_page: 'true',
      format: 'jpeg',
      block_ads: 'true',
      block_cookie_banners: 'true',
      delay: '300',
      viewport_width: '1920',
      viewport_height: '1080',
      response_type: 'json',
      timeout: '90'
    })

    console.log('Making screenshot request with params:', params.toString())
    
    const response = await fetch(`https://api.screenshotone.com/take?${params}`)
    console.log('Screenshot API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Screenshot API error:', errorText)
      throw new Error(`Screenshot API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('Screenshot API success, processing result')

    const popupData = {
      title: `Popup from ${url}`,
      description: 'Captured popup content',
      cta: 'View Details',
      image: result.url || result.image,
      backgroundColor: '#ffffff',
      textColor: '#000000'
    }

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