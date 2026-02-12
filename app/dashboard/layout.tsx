import React from "react"
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, BarChart3, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-muted/30 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-accent">API Monitor</h1>
          <p className="text-sm text-muted-foreground">Real-time monitoring</p>
        </div>

        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/endpoints"
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Endpoints</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-border">
          <div className="mb-4 rounded-lg bg-muted p-4 text-xs">
            <p className="text-muted-foreground">Logged in as</p>
            <p className="font-medium truncate">{user.email}</p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full bg-transparent">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  )
}
