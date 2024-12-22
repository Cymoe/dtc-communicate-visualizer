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
      full_page: 'true',
      format: 'jpeg',
      block_ads: 'true',
      block_cookie_banners: 'true',
      delay: '5', // Increased delay to ensure page loads
      viewport_width: '1280',
      viewport_height: '800'
    })

    console.log('Making screenshot request to:', `https://api.screenshotone.com/take?${params}`)
    
    const response = await fetch(`https://api.screenshotone.com/take?${params}`)
    console.log('Screenshot API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Screenshot API error:', errorText)
      throw new Error(`Screenshot API error: ${response.status} - ${errorText}`)
    }

    const imageBlob = await response.blob()
    console.log('Received image blob size:', imageBlob.size)
    
    if (imageBlob.size === 0) {
      throw new Error('Received empty image from Screenshot API')
    }

    const arrayBuffer = await imageBlob.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    console.log('Successfully generated base64 image, length:', base64.length)

    // Extract popup content from the page
    const popupData = {
      title: 'Website Popup',
      description: 'Captured popup from ' + url,
      cta: 'View Details',
      image: `data:image/jpeg;base64,${base64}`,
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