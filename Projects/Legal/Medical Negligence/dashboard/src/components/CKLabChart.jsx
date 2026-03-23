import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer, Legend,
} from 'recharts'
import ckData from '../data/ck-labs.json'

const PROCEDURES = ckData.keyProcedures
const VALUES = ckData.values.map(v => ({
  ...v,
  dateObj: new Date(v.date),
  displayDate: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
  valueNum: v.value,
})).sort((a, b) => a.dateObj - b.dateObj)

const BAND_COLORS = {
  normal:   '#22c55e22',
  elevated: '#f59e0b22',
  danger:   '#f9731622',
  crisis:   '#ef444422',
}

function eventColor(evt) {
  if (evt === 'hospitalization') return '#ef4444'
  if (evt === 'pre_crisis')      return '#f97316'
  return '#94a3b8'
}

const CustomDot = (props) => {
  const { cx, cy, payload } = props
  const color = eventColor(payload.event)
  return <circle cx={cx} cy={cy} r={payload.event === 'hospitalization' || payload.event === 'pre_crisis' ? 7 : 5} fill={color} stroke="#0f172a" strokeWidth={2} />
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs max-w-xs shadow-xl">
      <div className="font-bold text-white">{d.displayDate}</div>
      <div className="text-2xl font-bold text-red-300 my-1">{d.value.toLocaleString()} <span className="text-sm font-normal text-slate-400">U/L</span></div>
      <div className="text-slate-300">{d.note}</div>
    </div>
  )
}

export default function CKLabChart() {
  const [logScale, setLogScale] = useState(true)

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-2xl font-bold text-white">CK Lab Trending Chart</h1>
          <p className="text-slate-400 text-sm mt-1">Creatine Kinase values over time. Normal range: 35–232 U/L.</p>
        </div>
        <button
          onClick={() => setLogScale(!logScale)}
          className="text-xs px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white mt-1"
        >
          {logScale ? 'Linear scale' : 'Log scale'}
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        {[
          { label: 'Normal (<232)',    color: '#22c55e' },
          { label: 'Elevated (>232)',  color: '#f59e0b' },
          { label: 'Danger (>1,000)',  color: '#f97316' },
          { label: 'Crisis (>10,000)', color: '#ef4444' },
        ].map(b => (
          <span key={b.label} className="flex items-center gap-1 text-slate-400">
            <span className="w-3 h-3 rounded" style={{ background: b.color }}></span>
            {b.label}
          </span>
        ))}
        <span className="flex items-center gap-1 text-slate-400 ml-4">
          <svg width="16" height="2"><line x1="0" y1="1" x2="16" y2="1" stroke="#f97316" strokeWidth="2" strokeDasharray="4 2"/></svg>
          RFA Procedure
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4" style={{ height: 420 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={VALUES} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

            {/* Threshold bands */}
            <ReferenceArea y1={0}     y2={232}   fill="#22c55e15" />
            <ReferenceArea y1={232}   y2={1000}  fill="#f59e0b15" />
            <ReferenceArea y1={1000}  y2={10000} fill="#f9731615" />
            <ReferenceArea y1={10000} y2={30000} fill="#ef444415" />

            {/* Threshold lines */}
            <ReferenceLine y={232}   stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1} label={{ value: '232', fill: '#22c55e', fontSize: 10, position: 'right' }} />
            <ReferenceLine y={1000}  stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} label={{ value: '1K',  fill: '#f59e0b', fontSize: 10, position: 'right' }} />
            <ReferenceLine y={10000} stroke="#f97316" strokeDasharray="4 4" strokeWidth={1} label={{ value: '10K', fill: '#f97316', fontSize: 10, position: 'right' }} />

            {/* RFA procedure marker */}
            <ReferenceLine x="Jul 18, '25" stroke="#f97316" strokeDasharray="6 3" strokeWidth={2}
              label={{ value: 'RFA', fill: '#f97316', fontSize: 11, position: 'top' }} />

            <XAxis dataKey="displayDate" tick={{ fill: '#64748b', fontSize: 11 }} angle={-30} textAnchor="end" height={50} />
            <YAxis
              scale={logScale ? 'log' : 'linear'}
              domain={logScale ? [30, 30000] : [0, 25000]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey="valueNum"
              stroke="#ef4444"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 8 }}
              name="CK (U/L)"
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data table */}
      <h2 className="text-lg font-semibold text-white mt-6 mb-3">All CK Values</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs">
              <th className="text-left py-2 pr-4">Date</th>
              <th className="text-right py-2 pr-4">CK (U/L)</th>
              <th className="text-left py-2 pr-4">Status</th>
              <th className="text-left py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {[...VALUES].reverse().map((v, i) => {
              const level = v.valueNum > 10000 ? 'Crisis' : v.valueNum > 1000 ? 'Danger' : v.valueNum > 232 ? 'Elevated' : 'Normal'
              const levelColor = { Crisis: 'text-red-400', Danger: 'text-orange-400', Elevated: 'text-yellow-400', Normal: 'text-green-400' }[level]
              return (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-2 pr-4 font-mono text-slate-400 text-xs">{v.date}</td>
                  <td className={`py-2 pr-4 text-right font-bold ${levelColor}`}>{v.value.toLocaleString()}</td>
                  <td className={`py-2 pr-4 text-xs ${levelColor}`}>{level}</td>
                  <td className="py-2 text-slate-400 text-xs">{v.note}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
