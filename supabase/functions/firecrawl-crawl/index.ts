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

    // Take multiple screenshots with different delays to increase chances of capturing popups
    const delays = [0, 100, 200]
    const screenshots = []

    for (const delay of delays) {
      const params = new URLSearchParams({
        url: url,
        access_key: screenshotApiKey,
        full_page: 'true',
        format: 'jpeg',
        block_ads: 'true',
        block_cookie_banners: 'true',
        delay: delay.toString(),
        viewport_width: '1920',
        viewport_height: '1080',
        response_type: 'json',
        timeout: '30'
      })

      console.log(`Making screenshot request with delay ${delay}ms:`, params.toString())
      
      try {
        const response = await fetch(`https://api.screenshotone.com/take?${params}`)
        if (!response.ok) {
          console.error(`Screenshot failed for delay ${delay}ms:`, await response.text())
          continue
        }

        const result = await response.json()
        screenshots.push(result)
        console.log(`Successfully captured screenshot with ${delay}ms delay`)
      } catch (error) {
        console.error(`Error capturing screenshot with ${delay}ms delay:`, error)
      }
    }

    if (screenshots.length === 0) {
      throw new Error('Failed to capture any screenshots')
    }

    // Use the last successful screenshot
    const lastScreenshot = screenshots[screenshots.length - 1]
    
    const popupData = {
      title: `Popup from ${url}`,
      description: 'Captured popup content',
      cta: 'View Details',
      image: lastScreenshot.url || lastScreenshot.image,
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