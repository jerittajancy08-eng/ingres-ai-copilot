'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Droplet, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function Page() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // Redirect authenticated users to chat
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/chat')
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
                <Droplet className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">INGRES AI</div>
                <div className="text-xs text-slate-500">Groundwater Copilot</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2 text-sm font-medium text-white hover:shadow-lg hover:shadow-teal-500/25 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Ask anything about{' '}
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              groundwater
            </span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-xl text-slate-600">
            Get instant, AI-powered answers about groundwater levels, recharge cycles, borewell safety, and government schemes with real-time data and source citations.
          </p>

          {/* CTA */}
          <div className="flex flex-col gap-4 sm:flex-row justify-center">
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-8 py-4 text-base font-semibold text-white hover:shadow-xl hover:shadow-teal-500/30 transition-all"
            >
              Start Chatting
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 bg-white/50 backdrop-blur px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
                <Droplet className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-slate-900">INGRES AI</span>
            </div>
            <p className="text-sm text-slate-600">Government groundwater intelligence platform</p>
          </div>
          <div className="border-t border-slate-200 pt-8 flex items-center justify-between">
            <p className="text-sm text-slate-600">© 2026 INGRES AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
