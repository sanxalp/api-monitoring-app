import { createClient } from '@/lib/supabase/server'
import { EndpointsList } from '@/components/endpoints-list'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch summary statistics
  const { data: endpoints } = await supabase
    .from('endpoints')
    .select(
      `
      id,
      health_checks(status)
    `
    )
    .eq('user_id', user.id)

  const stats = {
    total: endpoints?.length || 0,
    healthy: endpoints?.filter((e: any) => {
      const latestCheck = e.health_checks?.[0]
      return latestCheck?.status === 'healthy'
    }).length || 0,
    degraded: endpoints?.filter((e: any) => {
      const latestCheck = e.health_checks?.[0]
      return latestCheck?.status === 'degraded'
    }).length || 0,
    down: endpoints?.filter((e: any) => {
      const latestCheck = e.health_checks?.[0]
      return latestCheck?.status === 'down'
    }).length || 0,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your API endpoints in real-time with health checks and performance metrics
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Endpoints</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Healthy</p>
              <p className="text-3xl font-bold text-green-600">{stats.healthy}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Degraded</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.degraded}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Down</p>
              <p className="text-3xl font-bold text-red-600">{stats.down}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Endpoints List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Monitored Endpoints</h2>
        <EndpointsList />
      </div>
    </div>
  )
}
