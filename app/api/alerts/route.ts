import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const filter = searchParams.get('filter') || 'all' // all, active, resolved

  // Fetch alerts for user's endpoints
  let query = supabase
    .from('alerts')
    .select(
      `
      id,
      type,
      severity,
      message,
      is_resolved,
      created_at,
      endpoints(name)
    `
    )
    .eq('user_id', user.id)

  // Apply filter
  if (filter === 'active') {
    query = query.eq('is_resolved', false)
  } else if (filter === 'resolved') {
    query = query.eq('is_resolved', true)
  }

  const { data: alerts, error } = await query.order('created_at', {
    ascending: false,
  })

  if (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    alerts?.map((alert: any) => ({
      id: alert.id,
      endpointName: alert.endpoints?.name || 'Unknown',
      alertType: alert.type,
      message: alert.message,
      severity: alert.severity,
      createdAt: alert.created_at,
      isResolved: alert.is_resolved,
    })) || []
  )
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
  const { endpointId, type, severity, message } = body

  if (!endpointId || !type || !severity || !message) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('alerts')
    .insert({
      user_id: user.id,
      endpoint_id: endpointId,
      type,
      severity,
      message,
      is_resolved: false,
    })
    .select()

  if (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0], { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { alertId, isResolved } = body

  if (!alertId) {
    return NextResponse.json(
      { error: 'Missing alert ID' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('alerts')
    .update({ is_resolved: isResolved })
    .eq('id', alertId)
    .eq('user_id', user.id)
    .select()

  if (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}
