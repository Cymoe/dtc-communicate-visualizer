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
      limit: 5,
      scrapeOptions: {
        formats: ['html'],
        timeout: 30000,
        // Using valid selectors for popup elements
        selector: [
          'div[class*="popup"]',
          'div[class*="modal"]',
          'div[class*="overlay"]',
          'div[id*="popup"]',
          'div[id*="modal"]',
          'div[role="dialog"]',
          'div[class*="newsletter"]',
          'div[id*="newsletter"]',
          'div[class*="exit"]',
          'div[class*="intent"]'
        ].join(', ')
      }
    })

    console.log('Raw crawl result:', result)

    // Process each found element to extract popup content
    const popups = await Promise.all(
      (result.data || []).map(async (item: any) => {
        const popupData = await processPopupContent(item.content || '');
        if (popupData) {
          console.log('Extracted popup:', popupData);
          return popupData;
        }
        return null;
      })
    );

    // Filter out null values and duplicates
    const validPopups = popups.filter((popup): popup is NonNullable<typeof popup> => 
      popup !== null && 
      popup.title !== null && 
      popup.description !== null
    );

    console.log('Processed popups:', validPopups);

    return new Response(
      JSON.stringify({ success: true, data: validPopups }),
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

async function processPopupContent(html: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract text content
    const titleElement = doc.querySelector('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="heading"]');
    const descriptionElement = doc.querySelector('p, [class*="description"], [class*="text"]');
    const buttonElement = doc.querySelector('button, a.button, .btn, [class*="cta"]');
    const imageElement = doc.querySelector('img');

    // Extract colors
    const backgroundColorElement = doc.querySelector('[style*="background"], [class*="bg-"]');
    const textColorElement = doc.querySelector('[style*="color"]');

    // Get background color from style or compute it
    let backgroundColor = '#FFFFFF';
    if (backgroundColorElement) {
      const style = backgroundColorElement.getAttribute('style');
      const bgColorMatch = style?.match(/background(?:-color)?:\s*(#[a-f0-9]{6}|#[a-f0-9]{3}|rgb\([^)]+\))/i);
      if (bgColorMatch) {
        backgroundColor = bgColorMatch[1];
      }
    }

    // Get text color from style or compute it
    let textColor = '#000000';
    if (textColorElement) {
      const style = textColorElement.getAttribute('style');
      const textColorMatch = style?.match(/color:\s*(#[a-f0-9]{6}|#[a-f0-9]{3}|rgb\([^)]+\))/i);
      if (textColorMatch) {
        textColor = textColorMatch[1];
      }
    }

    const popup = {
      title: titleElement?.textContent?.trim() || null,
      description: descriptionElement?.textContent?.trim() || null,
      cta: buttonElement?.textContent?.trim() || "Sign Up",
      image: imageElement?.getAttribute('src') || "/placeholder.svg",
      backgroundColor,
      textColor
    };

    // Only return if we have at least a title or description
    if (popup.title || popup.description) {
      return popup;
    }

    return null;
  } catch (error) {
    console.error('Error processing popup content:', error);
    return null;
  }
}