'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/card'

interface MetricsChartProps {
  data: Array<{
    time: string
    responseTime: number
    statusCode: number
  }>
  title: string
}

export function MetricsChart({ data, title }: MetricsChartProps) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="time" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="responseTime"
            stroke="#2563eb"
            dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#1d4ed8' }}
            name="Response Time (ms)"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
