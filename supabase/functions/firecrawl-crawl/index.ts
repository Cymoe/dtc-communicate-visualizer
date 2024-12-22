import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('Processing URL:', url)

    const screenshotApiKey = Deno.env.get('SCREENSHOT_API_KEY')
    if (!screenshotApiKey) {
      console.error('Screenshot API key not configured')
      throw new Error('Screenshot API key not configured')
    }

    // Using the correct parameter names for ScreenshotOne API
    const params = new URLSearchParams({
      url: url,
      access_key: screenshotApiKey,
      full_page: 'false', // Changed to false to capture viewport only
      format: 'jpeg',
      block_ads: 'true',
      block_cookie_banners: 'false', // Changed to false since we want to capture popups
      delay: '8', // Increased delay to ensure popups load
      viewport_width: '1440',
      viewport_height: '900',
      response_type: 'base64' // Request base64 response directly
    })

    console.log('Making screenshot request to:', `https://api.screenshotone.com/take?${params}`)
    
    const response = await fetch(`https://api.screenshotone.com/take?${params}`)
    console.log('Screenshot API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Screenshot API error:', errorText)
      throw new Error(`Screenshot API error: ${response.status} - ${errorText}`)
    }

    // Get the base64 image directly from the response
    const base64Image = await response.text()
    console.log('Received base64 image, length:', base64Image.length)
    
    if (!base64Image) {
      throw new Error('Received empty image from Screenshot API')
    }

    // Extract popup content from the page
    const popupData = {
      title: 'Website Popup',
      description: 'Captured popup from ' + url,
      cta: 'View Details',
      image: `data:image/jpeg;base64,${base64Image}`,
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