'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface Alert {
  id: string
  endpointName: string
  alertType: string
  message: string
  severity: 'critical' | 'warning' | 'info'
  createdAt: string
  isResolved: boolean
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active')

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(`/api/alerts?filter=${filter}`)
        const data = await response.json()
        setAlerts(data)
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [filter])

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'active') return !alert.isResolved
    if (filter === 'resolved') return alert.isResolved
    return true
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-blue-600 bg-blue-50'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Alerts</h1>
        <p className="text-muted-foreground">
          Monitor alerts and issues across your endpoints
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-border">
        {(['all', 'active', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              filter === f
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({
              alerts.filter((a) => {
                if (f === 'active') return !a.isResolved
                if (f === 'resolved') return a.isResolved
                return true
              }).length
            })
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card className="flex items-center justify-center py-12">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="text-muted-foreground">
                {filter === 'active'
                  ? 'No active alerts'
                  : 'No resolved alerts'}
              </p>
            </div>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-6 ${
                alert.isResolved
                  ? 'opacity-60'
                  : getSeverityColor(alert.severity)
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {alert.isResolved ? (
                    <CheckCircle className="h-5 w-5 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-semibold">{alert.alertType}</h3>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                </div>
                {alert.isResolved && (
                  <span className="text-xs font-medium px-2 py-1 bg-white rounded">
                    Resolved
                  </span>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm">
                <span className="font-medium">{alert.endpointName}</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {new Date(alert.createdAt).toLocaleString()}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
