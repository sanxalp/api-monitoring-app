import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch endpoints with their latest health check
  const { data: endpoints, error } = await supabase
    .from('endpoints')
    .select(
      `
      id,
      name,
      url,
      check_interval,
      created_at,
      health_checks(status, response_time, checked_at)
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching endpoints:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Process endpoints with latest metrics
  const processedEndpoints = endpoints.map((endpoint: any) => {
    const checks = endpoint.health_checks || []
    const latestCheck = checks[0]
    const totalChecks = checks.length
    const healthyChecks = checks.filter((c: any) => c.status === 'healthy').length

    return {
      id: endpoint.id,
      name: endpoint.name,
      url: endpoint.url,
      status: latestCheck?.status || 'unknown',
      uptime: totalChecks > 0 ? (healthyChecks / totalChecks) * 100 : 0,
      avgResponseTime: checks.length > 0
        ? Math.round(checks.reduce((sum: number, c: any) => sum + c.response_time, 0) / checks.length)
        : 0,
      lastCheck: latestCheck?.checked_at || new Date().toISOString(),
      checkInterval: endpoint.check_interval,
    }
  })

  return NextResponse.json(processedEndpoints)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, url, checkInterval } = body

  if (!name || !url || !checkInterval) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('endpoints')
    .insert({
      user_id: user.id,
      name,
      url,
      check_interval: checkInterval,
    })
    .select()

  if (error) {
    console.error('Error creating endpoint:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0], { status: 201 })
}
