'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { EndpointsList } from '@/components/endpoints-list'

export default function EndpointsPage() {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    checkInterval: 300,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ name: '', url: '', checkInterval: 300 })
        setIsAdding(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Error creating endpoint:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Endpoints</h1>
          <p className="text-muted-foreground">
            Manage the API endpoints you want to monitor
          </p>
        </div>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Endpoint
        </Button>
      </div>

      {/* Add Endpoint Form */}
      {isAdding && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Endpoint</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Endpoint Name
              </label>
              <Input
                type="text"
                placeholder="e.g., API Production"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                URL
              </label>
              <Input
                type="url"
                placeholder="https://api.example.com/health"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Check Interval (seconds)
              </label>
              <Input
                type="number"
                min="30"
                max="3600"
                value={formData.checkInterval}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    checkInterval: parseInt(e.target.value),
                  })
                }
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                How often to check this endpoint (30 seconds to 1 hour)
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Endpoint'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Endpoints List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Endpoints</h2>
        <EndpointsList />
      </div>
    </div>
  )
}
