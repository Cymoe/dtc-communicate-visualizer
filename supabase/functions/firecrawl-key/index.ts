// Follow Deno Deploy runtime API
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

  const apiKey = Deno.env.get('FIRECRAWL_API_KEY')
  
  if (!apiKey) {
    console.error('FIRECRAWL_API_KEY not found in environment variables')
    return new Response(
      JSON.stringify({ error: 'API key not found' }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }

  console.log('Successfully retrieved FIRECRAWL_API_KEY')
  return new Response(
    JSON.stringify({ apiKey }),
    { 
      status: 200,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  )
})