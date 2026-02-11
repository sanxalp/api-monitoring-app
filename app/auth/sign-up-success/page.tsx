'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard immediately since email confirmation is not required
    router.push('/dashboard')
  }, [router])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <p className="text-center text-muted-foreground">
          Redirecting to dashboard...
        </p>
      </div>
    </div>
  )
}
