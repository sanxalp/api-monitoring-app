import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Background job to check all endpoints
async function checkEndpointHealth(endpointId: string, url: string, userId: string, supabaseAdmin: any) {
  const startTime = Date.now()

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
    const responseTime = Date.now() - startTime
    const isHealthy = response.ok

    // Save health check result
    await supabaseAdmin.from('health_checks').insert({
      endpoint_id: endpointId,
      is_healthy: isHealthy,
      response_time_ms: responseTime,
      status_code: response.status,
      response_size_bytes: 0,
    })

    return { isHealthy, responseTime }
  } catch (error) {
    const responseTime = Date.now() - startTime

    // Save failed health check
    await supabaseAdmin.from('health_checks').insert({
      endpoint_id: endpointId,
      is_healthy: false,
      response_time_ms: responseTime,
      status_code: 0,
      error_message: error instanceof Error ? error.message : 'Unknown error',
    })

    return { isHealthy: false, responseTime }
  }
}

export async function POST(request: Request) {
  // Create an admin client to bypass RLS since cron has no user session
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      cookies: {
        getAll() { return [] },
        setAll() {}
      }
    }
  )

  // Verify the request is authorized (could be a cron job with a secret)
  const authHeader = request.headers.get('authorization')
  const expectedAuth = `Bearer ${process.env.HEALTH_CHECK_SECRET || 'test-secret'}`

  if (process.env.HEALTH_CHECK_SECRET && authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all endpoints that need checking
    const { data: endpoints, error } = await supabaseAdmin
      .from('endpoints')
      .select('id, url, check_interval_seconds')

    if (error) {
      console.error('Error fetching endpoints:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check all endpoints
    const results = []

    for (const endpoint of endpoints || []) {
      const result = await checkEndpointHealth(
        endpoint.id,
        endpoint.url,
        '',
        supabaseAdmin
      )
      results.push({ endpointId: endpoint.id, ...result })
    }

    return NextResponse.json({
      success: true,
      checked: results.length,
      results,
    })
  } catch (error: any) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
