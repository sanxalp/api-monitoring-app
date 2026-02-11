'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Bell, Lock, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    alertThresholdResponseTime: 2000,
    alertThresholdUptime: 95,
    slackWebhook: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In production, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 500))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your monitoring preferences and alert thresholds
        </p>
      </div>

      {saveSuccess && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium">Settings saved successfully</span>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <Bell className="h-5 w-5 text-accent mt-1" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Configure how you receive alerts
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) =>
                handleChange('emailNotifications', e.target.checked)
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm">Send email notifications for alerts</span>
          </label>

          <div>
            <label className="block text-sm font-medium mb-2">
              Slack Webhook URL (optional)
            </label>
            <Input
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              value={settings.slackWebhook}
              onChange={(e) =>
                handleChange('slackWebhook', e.target.value)
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Receive alerts directly in Slack
            </p>
          </div>
        </div>
      </Card>

      {/* Alert Thresholds */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <AlertCircle className="h-5 w-5 text-accent mt-1" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">Alert Thresholds</h2>
            <p className="text-sm text-muted-foreground">
              Set criteria for when alerts should be triggered
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Response Time Alert (ms)
            </label>
            <Input
              type="number"
              min="100"
              max="10000"
              step="100"
              value={settings.alertThresholdResponseTime}
              onChange={(e) =>
                handleChange(
                  'alertThresholdResponseTime',
                  parseInt(e.target.value)
                )
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Alert if response time exceeds this value
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Uptime Alert Threshold (%)
            </label>
            <Input
              type="number"
              min="50"
              max="99.9"
              step="0.1"
              value={settings.alertThresholdUptime}
              onChange={(e) =>
                handleChange(
                  'alertThresholdUptime',
                  parseFloat(e.target.value)
                )
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Alert if uptime falls below this percentage
            </p>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <Lock className="h-5 w-5 text-accent mt-1" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">Security</h2>
            <p className="text-sm text-muted-foreground">
              Manage your account security
            </p>
          </div>
        </div>

        <Button variant="outline" className="w-full bg-transparent">
          Change Password
        </Button>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
