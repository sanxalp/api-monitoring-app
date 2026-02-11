'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { MetricsChart } from '@/components/metrics-chart'
import { StatusBadge } from '@/components/status-badge'
import { ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface MetricData {
  time: string
  responseTime: number
  statusCode: number
}

export default function MetricsPage() {
  const params = useParams()
  const endpointId = params.endpointId as string
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h')
  const [stats, setStats] = useState({
    avgResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: 0,
    totalRequests: 0,
    successRate: 0,
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true)
      try {
        // In production, this would fetch from an API
        // For now, generate mock data
        const now = new Date()
        const mockData: MetricData[] = []
        const points = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 * 24 : 30 * 24

        for (let i = points; i > 0; i--) {
          const time = new Date(now.getTime() - i * 3600000)
          mockData.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            responseTime: Math.random() * 1000 + 200,
            statusCode: Math.random() > 0.05 ? 200 : 500,
          })
        }

        setMetrics(mockData)

        // Calculate statistics
        const responseTimes = mockData.map((d) => d.responseTime)
        const avgResponseTime = Math.round(
          responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        )
        const maxResponseTime = Math.round(Math.max(...responseTimes))
        const minResponseTime = Math.round(Math.min(...responseTimes))
        const successRate =
          (mockData.filter((d) => d.statusCode === 200).length / mockData.length) * 100

        setStats({
          avgResponseTime,
          maxResponseTime,
          minResponseTime,
          totalRequests: mockData.length,
          successRate: Math.round(successRate),
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [endpointId, timeRange])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-80 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link href="/dashboard">
        <Button variant="ghost" className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Metrics</h1>
          <p className="text-muted-foreground">
            Detailed performance analysis for endpoint {endpointId}
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Time Range Filter */}
      <div className="flex gap-2 border-b border-border">
        {(['24h', '7d', '30d'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              timeRange === range
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {range === '24h' ? 'Last 24h' : range === '7d' ? 'Last 7 days' : 'Last 30 days'}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg Response Time</p>
          <p className="text-2xl font-bold">{stats.avgResponseTime}ms</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Max Response Time</p>
          <p className="text-2xl font-bold">{stats.maxResponseTime}ms</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Min Response Time</p>
          <p className="text-2xl font-bold">{stats.minResponseTime}ms</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Requests</p>
          <p className="text-2xl font-bold">{stats.totalRequests}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
          <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
        </Card>
      </div>

      {/* Charts */}
      <MetricsChart data={metrics} title="Response Time Trend" />

      {/* Status Breakdown */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Status Breakdown</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-green-50">
            <p className="text-sm text-green-700 mb-2">Success (2xx)</p>
            <p className="text-3xl font-bold text-green-700">
              {metrics.filter((m) => m.statusCode >= 200 && m.statusCode < 300).length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-yellow-50">
            <p className="text-sm text-yellow-700 mb-2">Warnings (4xx)</p>
            <p className="text-3xl font-bold text-yellow-700">
              {metrics.filter((m) => m.statusCode >= 400 && m.statusCode < 500).length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-red-50">
            <p className="text-sm text-red-700 mb-2">Errors (5xx)</p>
            <p className="text-3xl font-bold text-red-700">
              {metrics.filter((m) => m.statusCode >= 500).length}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
