import { useEffect, useRef, useState } from 'react'

const tools = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'bg-brand/10 text-brand',
    title: 'Revenue Dashboard',
    description: 'See daily, weekly, and monthly revenue at a glance. Track your best-selling products and spot trends early.',
    metric: '₦2.4M',
    metricLabel: 'Avg. Monthly Revenue',
    change: '+32%',
    positive: true,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: 'bg-purple-100 text-purple-600',
    title: 'Inventory Manager',
    description: 'Track stock across all products. Get low-stock alerts, reorder reminders, and never miss a sale.',
    metric: '99.3%',
    metricLabel: 'Fulfilment Rate',
    change: '+5.2%',
    positive: true,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: 'bg-emerald-100 text-emerald-600',
    title: 'Payout Tracker',
    description: 'Transparent earnings breakdown, payout schedules, and transaction history all in one place.',
    metric: '2 days',
    metricLabel: 'Avg. Payout Time',
    change: '-40%',
    positive: true,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    color: 'bg-amber-100 text-amber-600',
    title: 'Order Management',
    description: 'Process orders, print invoices, manage returns, and communicate with buyers — all from your dashboard.',
    metric: '12 min',
    metricLabel: 'Avg. Processing Time',
    change: '-28%',
    positive: true,
  },
]

function ToolCard({ tool, index }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`group bg-white rounded-2xl border border-gray-100 p-6 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.color}`}>
          {tool.icon}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          tool.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
        }`}>
          {tool.change}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{tool.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-4">{tool.description}</p>
      <div className="pt-4 border-t border-gray-50">
        <div className="text-2xl font-bold text-gray-900">{tool.metric}</div>
        <div className="text-xs text-gray-400 mt-0.5">{tool.metricLabel}</div>
      </div>
    </div>
  )
}

export default function AccountingTools() {
  return (
    <section id="tools" className="py-24 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div className="space-y-6">
            <span className="section-tag">Business Tools</span>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
              Your business,{' '}
              <span className="text-gradient">fully under control</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              We built accounting and operations tools specifically for Nigerian merchants — so you spend less time on admin and more time growing your brand.
            </p>

            <div className="space-y-4">
              {[
                'Auto-generate sales reports & VAT summaries',
                'Multi-product & multi-variant inventory tracking',
                'Real-time order notifications via WhatsApp & email',
                'Printable invoices with your brand logo',
                'Bank-verified payout settlement',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>

            {/* Dashboard mockup image */}
            <div className="relative mt-4 rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80"
                alt="Vendor dashboard analytics"
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand/80 to-transparent flex items-end p-5">
                <div className="text-white">
                  <div className="text-sm font-medium opacity-80">Vendor Dashboard Preview</div>
                  <div className="text-lg font-bold">Built for Nigerian sellers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — cards grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {tools.map((tool, i) => (
              <ToolCard key={tool.title} tool={tool} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
