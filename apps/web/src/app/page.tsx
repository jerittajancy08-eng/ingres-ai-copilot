'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Droplet, BarChart3, Shield, Zap, ArrowRight } from 'lucide-react'

export default function Page() {
  const features = [
    {
      icon: Droplet,
      title: 'Groundwater Intelligence',
      description: 'Ask questions about groundwater levels, recharge, borewell safety, and district-level alerts.',
    },
    {
      icon: BarChart3,
      title: 'Document Analysis',
      description: 'Upload and analyze groundwater reports, studies, and technical documents with AI.',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure access for citizens, field teams, and administrators with RBAC.',
    },
    {
      icon: Zap,
      title: 'Real-Time Answers',
      description: 'Get instant answers powered by advanced AI with source citations.',
    },
  ]

  const examples = [
    'What are the current groundwater levels in my district?',
    'Summarize the key findings from the uploaded reports',
    'How does groundwater recharge work in dry seasons?',
    'What are the recommendations for borewell safety?',
  ]

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
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
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
          <div className="mb-16 flex flex-col gap-4 sm:flex-row justify-center">
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-8 py-4 text-base font-semibold text-white hover:shadow-xl hover:shadow-teal-500/30 transition-all"
            >
              Start Chatting
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/#features"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-8 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Learn More
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Demo/Screenshot placeholder */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-600/20 rounded-2xl blur-3xl" />
            <div className="relative rounded-2xl border border-slate-200/50 bg-white/50 backdrop-blur p-8 shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Droplet className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Chat interface preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900">Powerful Features</h2>
            <p className="text-lg text-slate-600">Everything you need for groundwater intelligence</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur p-6 hover:border-teal-500/50 hover:bg-white transition-all hover:shadow-lg hover:shadow-teal-500/10"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 p-3">
                    <Icon className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900">Example Questions</h2>
            <p className="text-lg text-slate-600">See what you can ask</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => (window.location.href = '/login')}
                className="rounded-lg border border-slate-200/50 bg-white/50 backdrop-blur p-4 text-left text-sm text-slate-700 hover:border-teal-500/50 hover:bg-white transition-all hover:shadow-md group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-teal-500 flex-shrink-0 group-hover:scale-125 transition-transform" />
                  <span>{example}</span>
                </div>
              </button>
            ))}
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
            <p className="text-sm text-slate-600">Groundwater intelligence platform</p>
          </div>
          <div className="border-t border-slate-200 pt-8 flex items-center justify-between">
            <p className="text-sm text-slate-600">© 2026 INGRES AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
