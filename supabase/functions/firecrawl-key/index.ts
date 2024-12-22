import { serve } from 'https://deno.fresh.dev/server/mod.ts'

serve(async (_req) => {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY')
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API key not found' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({ apiKey }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  )
})