import { cn } from '@/lib/utils'

type Status = 'healthy' | 'degraded' | 'down' | 'unknown'

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig = {
  healthy: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
    label: 'Healthy',
  },
  degraded: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    dot: 'bg-yellow-500',
    label: 'Degraded',
  },
  down: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
    label: 'Down',
  },
  unknown: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    dot: 'bg-gray-500',
    label: 'Unknown',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      <div className={cn('h-2 w-2 rounded-full', config.dot)} />
      {config.label}
    </div>
  )
}
