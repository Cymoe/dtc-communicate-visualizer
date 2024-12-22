import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts"

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
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Launching browser to capture popup screenshots for URL:', url)
    const browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage()
    
    try {
      console.log('Navigating to URL:', url)
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
      
      // Wait for potential popups to appear
      await page.waitForTimeout(5000)
      
      // Look for common popup selectors
      const popupSelectors = [
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

      const popups = []
      
      for (const selector of popupSelectors) {
        console.log('Checking selector:', selector)
        const elements = await page.$$(selector)
        
        for (const element of elements) {
          try {
            // Get element properties
            const textContent = await element.evaluate(el => el.textContent)
            const backgroundColor = await element.evaluate(el => 
              window.getComputedStyle(el).backgroundColor
            )
            const textColor = await element.evaluate(el => 
              window.getComputedStyle(el).color
            )
            
            // Take screenshot of the popup
            const screenshot = await element.screenshot({
              encoding: 'base64',
              type: 'jpeg',
              quality: 80
            })

            // Extract potential CTA button
            const ctaButton = await element.$('button, a[class*="button"], .btn')
            const ctaText = ctaButton 
              ? await ctaButton.evaluate(el => el.textContent?.trim() || 'Click Here')
              : 'Click Here'

            console.log('Found popup with title:', textContent?.split('\n')[0]?.trim() || 'Popup')
            popups.push({
              title: textContent?.split('\n')[0]?.trim() || 'Popup',
              description: textContent?.split('\n').slice(1).join(' ').trim() || 'Sign up for exclusive offers',
              cta: ctaText,
              image: `data:image/jpeg;base64,${screenshot}`,
              backgroundColor: backgroundColor || '#FFFFFF',
              textColor: textColor || '#000000'
            })
          } catch (error) {
            console.error('Error processing popup element:', error)
          }
        }
      }

      // Use default popup if no content was found
      const defaultPopup = {
        title: "Welcome",
        description: "Sign up for exclusive offers",
        cta: "Sign Up Now",
        image: "/placeholder.svg",
        backgroundColor: "#FFFFFF",
        textColor: "#000000"
      }

      const popupContent = popups.length > 0 ? popups : [defaultPopup]
      console.log('Successfully processed popups:', popupContent.length)

      return new Response(
        JSON.stringify({ success: true, data: popupContent }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } finally {
      if (browser) {
        await browser.close()
      }
    }
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