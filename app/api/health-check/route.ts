import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Background job to check all endpoints
async function checkEndpointHealth(endpointId: string, url: string, userId: string) {
  const supabase = await createClient()
  const startTime = Date.now()

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
    const responseTime = Date.now() - startTime
    const status = response.ok ? 'healthy' : 'degraded'

    // Save health check result
    await supabase.from('health_checks').insert({
      endpoint_id: endpointId,
      status,
      response_time: responseTime,
      status_code: response.status,
      checked_at: new Date().toISOString(),
    })

    return { status, responseTime }
  } catch (error) {
    const responseTime = Date.now() - startTime

    // Save failed health check
    await supabase.from('health_checks').insert({
      endpoint_id: endpointId,
      status: 'down',
      response_time: responseTime,
      status_code: 0,
      checked_at: new Date().toISOString(),
    })

    return { status: 'down', responseTime }
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()

  // Verify the request is authorized (could be a cron job with a secret)
  const authHeader = request.headers.get('authorization')
  const expectedAuth = `Bearer ${process.env.HEALTH_CHECK_SECRET || 'test-secret'}`

  if (process.env.HEALTH_CHECK_SECRET && authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all endpoints that need checking
    const { data: endpoints, error } = await supabase
      .from('endpoints')
      .select('id, url, user_id, check_interval, last_checked')

    if (error) {
      console.error('Error fetching endpoints:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check endpoints that haven't been checked recently
    const now = new Date()
    const results = []

    for (const endpoint of endpoints || []) {
      const lastChecked = endpoint.last_checked
        ? new Date(endpoint.last_checked)
        : new Date(0)
      const timeSinceCheck = (now.getTime() - lastChecked.getTime()) / 1000

      // Check if it's time to check this endpoint
      if (timeSinceCheck >= endpoint.check_interval) {
        const result = await checkEndpointHealth(
          endpoint.id,
          endpoint.url,
          endpoint.user_id
        )
        results.push({ endpointId: endpoint.id, ...result })

        // Update last_checked timestamp
        await supabase
          .from('endpoints')
          .update({ last_checked: new Date().toISOString() })
          .eq('id', endpoint.id)
      }
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
