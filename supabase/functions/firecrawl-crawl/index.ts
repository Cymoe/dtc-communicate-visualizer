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
      throw new Error('Screenshot API key not configured')
    }

    // Simplified API parameters - removed unsupported parameters
    const params = new URLSearchParams({
      url: url,
      access_key: screenshotApiKey,
      full_page: 'true',
      format: 'jpeg',
    })

    console.log('Making screenshot request with params:', params.toString())
    
    const response = await fetch(`https://api.screenshotone.com/take?${params}`)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Screenshot API error:', errorText)
      throw new Error(`Screenshot API error: ${response.status} - ${errorText}`)
    }

    const imageBlob = await response.blob()
    const arrayBuffer = await imageBlob.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    return new Response(
      JSON.stringify({
        success: true,
        data: [{
          title: 'Website Popup',
          description: 'Captured popup from website',
          cta: 'View Details',
          image: `data:image/jpeg;base64,${base64}`,
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