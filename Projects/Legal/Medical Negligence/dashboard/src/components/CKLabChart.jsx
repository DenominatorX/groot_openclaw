import { useState, useRef, useEffect } from 'react'
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer, Area, Scatter,
} from 'recharts'
import ckData from '../data/ck-labs.json'

const PROCEDURES = ckData.keyProcedures || []
const VALUES = ckData.values.map(v => ({
  ...v,
  dateObj: new Date(v.date),
  displayDate: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: "'yy" }),
  valueNum: v.value,
  isCrisis: v.value >= 10000,
  isDanger: v.value >= 1000 && v.value < 10000,
  isHosp: v.event === 'hospitalization',
})).sort((a, b) => a.dateObj - b.dateObj)

const MAX_CK = Math.max(...VALUES.map(v => v.valueNum))
const CRISIS_IDX = VALUES.findIndex(v => v.valueNum === MAX_CK)

const CustomDot = (props) => {
  const { cx, cy, payload } = props
  if (payload.isCrisis) {
    return (
      <g>
        {/* Outer pulse ring */}
        <circle cx={cx} cy={cy} r={18} fill="rgba(239,68,68,0)" stroke="#ef4444" strokeWidth={1} opacity={0.3} className="crisis-ring" />
        <circle cx={cx} cy={cy} r={11} fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth={1.5} opacity={0.6} />
        <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#7f1d1d" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={3} fill="#fca5a5" />
      </g>
    )
  }
  if (payload.isHosp) {
    return <circle cx={cx} cy={cy} r={6} fill="#f97316" stroke="#0f172a" strokeWidth={2} />
  }
  if (payload.isDanger) {
    return <circle cx={cx} cy={cy} r={5} fill="#f59e0b" stroke="#0f172a" strokeWidth={1.5} />
  }
  return <circle cx={cx} cy={cy} r={4} fill="#22c55e" stroke="#0f172a" strokeWidth={1.5} />
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const level = d.isCrisis ? { label: 'CRISIS', cls: 'text-red-400 bg-red-950/80 border-red-600' }
    : d.isDanger ? { label: 'DANGER', cls: 'text-orange-400 bg-orange-950/80 border-orange-600' }
    : d.valueNum > 232 ? { label: 'ELEVATED', cls: 'text-yellow-400 bg-yellow-950/80 border-yellow-600' }
    : { label: 'NORMAL', cls: 'text-green-400 bg-green-950/80 border-green-600' }

  return (
    <div className={`border rounded-xl p-4 text-xs shadow-2xl max-w-xs ${level.cls}`} style={{ backdropFilter: 'blur(8px)' }}>
      <div className="font-bold text-white text-sm mb-1">{d.displayDate}</div>
      <div className={`text-3xl font-black tabular-nums mb-1 ${level.label === 'CRISIS' ? 'text-red-300' : level.label === 'DANGER' ? 'text-orange-300' : level.label === 'ELEVATED' ? 'text-yellow-300' : 'text-green-300'}`}>
        {d.value.toLocaleString()}
        <span className="text-sm font-normal text-slate-400 ml-1">U/L</span>
      </div>
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] tracking-widest ${
        level.label === 'CRISIS' ? 'bg-red-800 text-red-200' :
        level.label === 'DANGER' ? 'bg-orange-800 text-orange-200' :
        level.label === 'ELEVATED' ? 'bg-yellow-800 text-yellow-200' :
        'bg-green-800 text-green-200'
      }`}>
        ● {level.label}
      </div>
      {d.note && <div className="text-slate-300 mt-2 leading-relaxed">{d.note}</div>}
      {d.isHosp && <div className="mt-1 text-red-300 font-semibold">⚕ Hospitalization</div>}
    </div>
  )
}

// Custom XAxis tick — only show a subset of dates to avoid crowding
const CustomXTick = ({ x, y, payload, index, visibleCount }) => {
  // Only render every Nth tick
  const stride = Math.max(1, Math.floor(VALUES.length / 12))
  if (index % stride !== 0) return null
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={14} textAnchor="middle" fill="#475569" fontSize={10} transform="rotate(-20)">
        {payload.value}
      </text>
    </g>
  )
}

export default function CKLabChart() {
  const [logScale, setLogScale] = useState(true)
  const [animClass, setAnimClass] = useState('')

  useEffect(() => {
    // Trigger crisis animation after mount
    const t = setTimeout(() => setAnimClass('crisis-pulse-active'), 800)
    return () => clearTimeout(t)
  }, [])

  const crisisVal = VALUES[CRISIS_IDX]

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-2xl font-bold text-white">CK Lab Trending Chart</h1>
          <p className="text-slate-400 text-sm mt-1">
            Creatine Kinase over time. Normal range: 35–232 U/L.
            <span className="ml-2 text-red-400 font-semibold">Peak: {MAX_CK.toLocaleString()} U/L — Aug 6, 2025</span>
          </p>
        </div>
        <button
          onClick={() => setLogScale(!logScale)}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors mt-1 flex-shrink-0"
        >
          {logScale ? '📐 Linear' : '📐 Log scale'}
        </button>
      </div>

      {/* Crisis callout banner */}
      <div className={`mb-4 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 flex items-center gap-3 crisis-callout ${animClass}`}>
        <div className="text-2xl flex-shrink-0">🚨</div>
        <div className="flex-1">
          <div className="text-red-300 font-bold text-sm">Aug 6, 2025 — Catastrophic Rhabdo Event</div>
          <div className="text-red-400/80 text-xs mt-0.5">CK peaked at <span className="font-black text-red-300">{MAX_CK.toLocaleString()} U/L</span> — {(MAX_CK / 232).toFixed(0)}× above normal upper limit. Following RFA procedure Jul 18, 2025.</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-red-300 font-black text-2xl tabular-nums">{MAX_CK.toLocaleString()}</div>
          <div className="text-red-500 text-xs">U/L · CRISIS</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        {[
          { label: 'Normal (<232)',     color: '#22c55e' },
          { label: 'Elevated (>232)',   color: '#f59e0b' },
          { label: 'Danger (>1,000)',   color: '#f97316' },
          { label: 'Crisis (>10,000)', color: '#ef4444' },
        ].map(b => (
          <span key={b.label} className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-3 rounded-full" style={{ background: b.color, boxShadow: `0 0 6px ${b.color}60` }}></span>
            {b.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-slate-400 ml-2">
          <svg width="16" height="10"><line x1="0" y1="5" x2="16" y2="5" stroke="#f97316" strokeWidth={2} strokeDasharray="4 2"/></svg>
          RFA Procedure
        </span>
        <span className="flex items-center gap-1.5 text-slate-400">
          <svg width="16" height="10"><line x1="0" y1="5" x2="16" y2="5" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2"/></svg>
          Crisis Event
        </span>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-2xl" style={{ height: 440 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={VALUES} margin={{ top: 15, right: 30, bottom: 40, left: 10 }}>
            <defs>
              <linearGradient id="ckGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

            {/* Threshold bands */}
            <ReferenceArea y1={1}      y2={232}   fill="#22c55e0a" />
            <ReferenceArea y1={232}    y2={1000}  fill="#f59e0b0a" />
            <ReferenceArea y1={1000}   y2={10000} fill="#f973160a" />
            <ReferenceArea y1={10000}  y2={30000} fill="#ef44440d" />

            {/* Threshold dashed lines */}
            <ReferenceLine y={232}   stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1}
              label={{ value: '232 (Normal max)', fill: '#22c55e80', fontSize: 9, position: 'insideRight' }} />
            <ReferenceLine y={1000}  stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1}
              label={{ value: '1K', fill: '#f59e0b80', fontSize: 9, position: 'insideRight' }} />
            <ReferenceLine y={10000} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1}
              label={{ value: '10K (Crisis)', fill: '#ef444480', fontSize: 9, position: 'insideRight' }} />

            {/* RFA procedure vertical marker */}
            <ReferenceLine
              x={VALUES.find(v => v.note?.includes('RFA'))?.displayDate || "Jul 18, '25"}
              stroke="#f97316" strokeDasharray="6 3" strokeWidth={1.5}
              label={{ value: 'RFA', fill: '#f97316', fontSize: 11, position: 'top' }}
            />

            {/* Crisis event vertical marker */}
            <ReferenceLine
              x={crisisVal?.displayDate}
              stroke="#ef4444" strokeDasharray="6 3" strokeWidth={2}
              label={{ value: '🚨 CRISIS', fill: '#ef4444', fontSize: 11, position: 'top' }}
            />

            <XAxis
              dataKey="displayDate"
              tick={<CustomXTick />}
              height={50}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis
              scale={logScale ? 'log' : 'linear'}
              domain={logScale ? [30, 30000] : [0, 25000]}
              tick={{ fill: '#475569', fontSize: 11 }}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
              width={45}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Area fill under line */}
            <Area
              type="monotone"
              dataKey="valueNum"
              fill="url(#ckGradient)"
              stroke="none"
              connectNulls={false}
            />

            {/* Main CK line */}
            <Line
              type="monotone"
              dataKey="valueNum"
              stroke="#ef4444"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 9, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 2 }}
              name="CK (U/L)"
              connectNulls={false}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Crisis context card */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-center">
          <div className="text-slate-400 text-xs mb-1">Peak CK</div>
          <div className="text-red-300 font-black text-2xl tabular-nums">{MAX_CK.toLocaleString()}</div>
          <div className="text-slate-500 text-xs">U/L · Aug 6, 2025</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-center">
          <div className="text-slate-400 text-xs mb-1">× Normal Upper Limit</div>
          <div className="text-orange-300 font-black text-2xl tabular-nums">{(MAX_CK / 232).toFixed(0)}×</div>
          <div className="text-slate-500 text-xs">above 232 U/L threshold</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-center">
          <div className="text-slate-400 text-xs mb-1">Hospitalizations</div>
          <div className="text-yellow-300 font-black text-2xl tabular-nums">{VALUES.filter(v => v.isHosp).length}</div>
          <div className="text-slate-500 text-xs">documented events</div>
        </div>
      </div>

      {/* Data table */}
      <h2 className="text-lg font-semibold text-white mt-6 mb-3">All CK Values</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/60 border-b border-slate-700 text-slate-400 text-xs">
              <th className="text-left py-2.5 px-3">Date</th>
              <th className="text-right py-2.5 px-3">CK (U/L)</th>
              <th className="text-left py-2.5 px-3">Status</th>
              <th className="text-left py-2.5 px-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {[...VALUES].reverse().map((v, i) => {
              const level = v.isCrisis ? 'Crisis' : v.isDanger ? 'Danger' : v.valueNum > 232 ? 'Elevated' : 'Normal'
              const levelStyle = {
                Crisis:   'text-red-300 bg-red-900/30',
                Danger:   'text-orange-300 bg-orange-900/30',
                Elevated: 'text-yellow-300 bg-yellow-900/30',
                Normal:   'text-green-300',
              }[level]
              return (
                <tr key={i} className={`border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors ${v.isCrisis ? 'bg-red-950/20' : ''}`}>
                  <td className="py-2 px-3 font-mono text-slate-400 text-xs">{v.date}</td>
                  <td className={`py-2 px-3 text-right font-bold tabular-nums ${levelStyle}`}>{v.value.toLocaleString()}</td>
                  <td className="py-2 px-3">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${levelStyle}`}>{level}</span>
                  </td>
                  <td className="py-2 px-3 text-slate-400 text-xs">{v.note}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
