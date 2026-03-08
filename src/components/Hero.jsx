import { useEffect, useRef, useState } from 'react'
import { VENDOR_IMAGES, STATS } from '../data/constants'

function StatCard({ value, label, index }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div className="text-3xl lg:text-4xl font-bold text-white">{value}</div>
      <div className="text-white/60 text-sm mt-1">{label}</div>
    </div>
  )
}

export default function Hero({ onOpenWaitlist }) {
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActiveImg(i => (i + 1) % VENDOR_IMAGES.length), 3500)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#08082e]">
      {/* Background grid */}
      <div className="absolute inset-0 bg-dot opacity-40" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand/30 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-12 lg:pt-36">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center flex-1">
          {/* Left — copy */}
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 bg-brand/20 text-brand-200 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full border border-brand/30">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow" />
                Early Vendor Access — Now Open
              </span>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.12] tracking-tight">
                Grow Your Business<br />
                on Nigeria's{' '}
                <span className="text-gradient bg-gradient-to-r from-brand-300 to-purple-400 bg-clip-text text-transparent">
                  #1 Gift
                </span>{' '}
                Marketplace
              </h1>
              <p className="text-white/60 text-lg lg:text-xl leading-relaxed max-w-lg">
                Join thousands of Nigerian vendors selling gifts, fashion, food, beauty, and more — with smart tools to track sales, manage orders, and scale faster.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onOpenWaitlist}
                className="btn-primary text-base flex items-center justify-center gap-2"
              >
                Join the Waitlist
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <a
                href="#features"
                className="flex items-center justify-center gap-2 text-white/70 hover:text-white font-medium transition-colors group"
              >
                <span className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/60 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
                See what's included
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex -space-x-3">
                {[
                  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=60&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&q=80',
                  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=60&q=80',
                  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=60&q=80',
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="vendor"
                    className="w-9 h-9 rounded-full border-2 border-[#08082e] object-cover"
                  />
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-[#08082e] bg-brand flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+</span>
                </div>
              </div>
              <p className="text-white/50 text-sm">
                <span className="text-white font-semibold">800+ vendors</span> already on the waitlist
              </p>
            </div>
          </div>

          {/* Right — image collage */}
          <div className="relative h-[420px] lg:h-[520px]">
            {/* Main featured image */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              {VENDOR_IMAGES.map((img, i) => (
                <img
                  key={img.url}
                  src={img.url}
                  alt={img.alt}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    i === activeImg ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-[#08082e]/80 via-transparent to-transparent" />

              {/* Category badge */}
              <div className="absolute bottom-5 left-5 right-5">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-white text-sm font-medium">{VENDOR_IMAGES[activeImg].category}</span>
                </div>
              </div>
            </div>

            {/* Floating card — earnings */}
            <div className="absolute -left-6 top-8 bg-white rounded-2xl shadow-2xl p-4 w-44 animate-float">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500 font-medium">Today's Sales</span>
              </div>
              <div className="text-xl font-bold text-gray-900">₦124,800</div>
              <div className="text-xs text-green-600 font-medium mt-1">+18% from yesterday</div>
            </div>

            {/* Floating card — orders */}
            <div className="absolute -right-4 bottom-20 bg-white rounded-2xl shadow-2xl p-4 w-40" style={{ animation: 'float 6s ease-in-out infinite 1.5s' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-brand/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500 font-medium">New Orders</span>
              </div>
              <div className="text-xl font-bold text-gray-900">47</div>
              <div className="flex gap-1 mt-2">
                {[8, 5, 9, 6, 7].map((h, i) => (
                  <div key={i} className="flex-1 bg-brand/20 rounded-sm" style={{ height: `${h * 3}px` }} />
                ))}
              </div>
            </div>

            {/* Image dots indicator */}
            <div className="absolute bottom-4 right-4 flex gap-1.5">
              {VENDOR_IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeImg ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 border-t border-white/10 pt-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
