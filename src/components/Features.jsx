import { useEffect, useRef, useState } from 'react'
import { VENDOR_BENEFITS } from '../data/constants'

function FeatureCard({ icon, title, description, index }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`group p-6 lg:p-8 rounded-2xl border border-gray-100 bg-white hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5 transition-all duration-500 cursor-default ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="w-14 h-14 bg-brand/8 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:bg-brand/15 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

export default function Features() {
  const [visible, setVisible] = useState(false)
  const headerRef = useRef()

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (headerRef.current) obs.observe(headerRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="features" className="py-24 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <span className="section-tag mb-4">Why Giftseon</span>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
            Everything a vendor needs to{' '}
            <span className="text-gradient">thrive and scale</span>
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            From day one, you'll have the tools, data, and support to build a successful business on Giftseon.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VENDOR_BENEFITS.map((b, i) => (
            <FeatureCard key={b.title} {...b} index={i} />
          ))}
        </div>

        {/* Early Access Banner */}
        <div className="mt-14 relative overflow-hidden rounded-3xl bg-brand p-10 lg:p-14">
          <div className="absolute inset-0 bg-dot opacity-20" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                Limited Spots Available
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Be an early merchant. Enjoy exclusive perks.
              </h3>
              <p className="text-white/70 text-base max-w-lg">
                Zero platform fees for your first 3 months. Featured vendor placement. Priority onboarding call. Only for waitlist members.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="flex gap-3 text-center">
                {['0%', '3 mo', '#1'].map((val, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/20">
                    <div className="text-2xl font-bold text-white">{val}</div>
                    <div className="text-white/60 text-xs mt-1">
                      {['Platform Fee', 'Free Access', 'Placement'][i]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
