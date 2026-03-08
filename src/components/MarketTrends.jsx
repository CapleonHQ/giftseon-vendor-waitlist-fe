import { useEffect, useRef, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'
import { SALES_CHART_DATA, CATEGORY_DATA } from '../data/constants'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-4 text-sm">
        <p className="text-gray-500 font-medium mb-2">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name === 'revenue' ? `₦${p.value.toLocaleString()}` : `${p.value} orders`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-3 text-sm">
        <p className="font-semibold text-gray-800">{payload[0].name}</p>
        <p className="text-brand font-bold">{payload[0].value}% of market</p>
      </div>
    )
  }
  return null
}

function AnimatedCard({ children, index, className = '' }) {
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
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {children}
    </div>
  )
}

export default function MarketTrends() {
  return (
    <section id="trends" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="section-tag mb-4">Market Insights</span>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
            The gifting economy is{' '}
            <span className="text-gradient">booming in Nigeria</span>
          </h2>
          <p className="mt-4 text-gray-500 text-lg">
            Real data showing vendor revenue potential and top product categories on our platform.
          </p>
        </div>

        {/* Chart 1 — Revenue trend */}
        <AnimatedCard index={0} className="mb-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Projected Vendor Revenue Growth</h3>
                <p className="text-sm text-gray-400 mt-1">Combined monthly revenue across all vendor categories (₦)</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="w-3 h-1 bg-brand rounded-full inline-block" />
                  Revenue
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="w-3 h-1 bg-purple-400 rounded-full inline-block" />
                  Orders
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={SALES_CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a1abc" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1a1abc" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="revenue"
                  orientation="left"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₦${v / 1000}K`}
                />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1a1abc"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#1a1abc' }}
                />
                <Area
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  fill="url(#ordersGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#a78bfa' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        {/* Chart 2 — Category breakdown + Bar */}
        <div className="grid lg:grid-cols-2 gap-6">
          <AnimatedCard index={1}>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Top Selling Categories</h3>
              <p className="text-sm text-gray-400 mb-6">Market share by product type</p>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={CATEGORY_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {CATEGORY_DATA.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {CATEGORY_DATA.map((c) => (
                  <div key={c.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="text-gray-600 truncate">{c.name}</span>
                    <span className="text-gray-900 font-semibold ml-auto">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard index={2}>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Q4 Peak Season Orders</h3>
              <p className="text-sm text-gray-400 mb-6">Monthly order volume — gifting season surge</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={SALES_CHART_DATA.slice(6)} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                    formatter={(v) => [v, 'Orders']}
                  />
                  <Bar dataKey="orders" radius={[8, 8, 0, 0]}>
                    {SALES_CHART_DATA.slice(6).map((_, i) => (
                      <Cell
                        key={i}
                        fill={i >= 4 ? '#1a1abc' : '#e0e7ff'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </section>
  )
}
