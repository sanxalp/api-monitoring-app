'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { StatusBadge } from './status-badge'
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react'

interface Endpoint {
  id: string
  name: string
  url: string
  status: 'healthy' | 'degraded' | 'down' | 'unknown'
  uptime: number
  avgResponseTime: number
  lastCheck: string
  checkInterval: number
}

export function EndpointsList() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEndpoints = async () => {
      try {
        const response = await fetch('/api/endpoints')
        if (!response.ok) {
          throw new Error('Failed to fetch endpoints')
        }
        const data = await response.json()
        setEndpoints(data)
      } catch (error) {
        console.error('Failed to fetch endpoints:', error)
        setEndpoints([])
      } finally {
        setLoading(false)
      }
    }

    fetchEndpoints()
    const interval = setInterval(fetchEndpoints, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {endpoints.length === 0 ? (
        <Card className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No endpoints configured yet</p>
            <a href="/dashboard/endpoints" className="text-accent hover:underline mt-2 inline-block">
              Add an endpoint →
            </a>
          </div>
        </Card>
      ) : (
        endpoints.map((endpoint) => (
          <Card key={endpoint.id} className="p-6 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{endpoint.name}</h3>
                <p className="text-sm text-muted-foreground font-mono">{endpoint.url}</p>
              </div>
              <StatusBadge status={endpoint.status} />
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Uptime</p>
                <div className="flex items-center gap-1">
                  {endpoint.uptime >= 99.5 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">{endpoint.uptime.toFixed(2)}%</span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Avg Response</p>
                <span className="font-medium">{endpoint.avgResponseTime}ms</span>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Check Interval</p>
                <span className="font-medium">{endpoint.checkInterval}s</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
              Last check: {new Date(endpoint.lastCheck).toLocaleString()}
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
