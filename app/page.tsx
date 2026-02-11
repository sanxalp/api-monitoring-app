import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Activity, TrendingUp, Bell, BarChart3 } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Activity className="h-10 w-10 text-accent" />
              <h1 className="text-4xl md:text-5xl font-bold">
                API Monitor
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Real-time monitoring and alerting for your API endpoints
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-start gap-3">
                <Activity className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Real-time Monitoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Check your endpoints every 30 seconds to 1 hour
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Performance Metrics</h3>
                  <p className="text-sm text-muted-foreground">
                    Track response times and uptime with historical data
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-start gap-3">
                <Bell className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Smart Alerts</h3>
                  <p className="text-sm text-muted-foreground">
                    Get notified via email or Slack when issues arise
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Trend Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze patterns and trends in endpoint performance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/auth/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Footer */}
          <div className="pt-12 border-t border-border text-center text-sm text-muted-foreground">
            <p>Start monitoring your APIs today. No credit card required.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
