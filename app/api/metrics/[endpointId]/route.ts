import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ endpointId: string }> }
) {
  const supabase = await createClient()
  const { endpointId } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get query parameters for time range
  const { searchParams } = new URL(request.url)
  const timeRange = searchParams.get('timeRange') || '24h'

  // Calculate time threshold
  let hoursAgo = 24
  if (timeRange === '7d') hoursAgo = 7 * 24
  if (timeRange === '30d') hoursAgo = 30 * 24

  const thresholdDate = new Date(Date.now() - hoursAgo * 3600000).toISOString()

  // Verify endpoint ownership
  const { data: endpoint, error: endpointError } = await supabase
    .from('endpoints')
    .select('id')
    .eq('id', endpointId)
    .eq('user_id', user.id)
    .single()

  if (endpointError || !endpoint) {
    return NextResponse.json(
      { error: 'Endpoint not found or unauthorized' },
      { status: 404 }
    )
  }

  // Fetch health checks for the endpoint
  const { data: healthChecks, error } = await supabase
    .from('health_checks')
    .select('*')
    .eq('endpoint_id', endpointId)
    .gte('checked_at', thresholdDate)
    .order('checked_at', { ascending: true })

  if (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Calculate statistics
  const metrics = healthChecks || []
  const responseTimes = metrics.map((m: any) => m.response_time)

  const stats = {
    avgResponseTime: Math.round(
      responseTimes.length > 0
        ? responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length
        : 0
    ),
    maxResponseTime: Math.max(...responseTimes, 0),
    minResponseTime: Math.min(...responseTimes, Infinity),
    totalRequests: metrics.length,
    successRate: metrics.length > 0
      ? Math.round(
          (metrics.filter((m: any) => m.status === 'healthy').length / metrics.length) * 100
        )
      : 0,
  }

  return NextResponse.json({
    endpointId,
    timeRange,
    stats,
    metrics: metrics.map((m: any) => ({
      time: new Date(m.checked_at).toLocaleString(),
      responseTime: m.response_time,
      statusCode: m.status_code,
    })),
  })
}
