import { useState, useEffect } from 'react'
import MedicalTimeline from './components/MedicalTimeline'
import CKLabChart from './components/CKLabChart'
import LabPanelSummary from './components/LabPanelSummary'
import ProviderMap from './components/ProviderMap'
import CaseStrengthMeter from './components/CaseStrengthMeter'
import DocumentLibrary from './components/DocumentLibrary'
import DamagesCalculator from './components/DamagesCalculator'
import LegalStatusPanel from './components/LegalStatusPanel'
import GenomeIntegration from './components/GenomeIntegration'
import CounterArgumentsViewer from './components/CounterArgumentsViewer'

const MODULES = [
  { id: 'legal',      label: 'Legal Status',      icon: '🏛️', alert: true  },
  { id: 'ck-chart',   label: 'CK Lab Trends',      icon: '📈', alert: true  },
  { id: 'timeline',   label: 'Medical Timeline',   icon: '📅', alert: false },
  { id: 'labs',       label: 'Lab Summary',        icon: '🧪', alert: false },
  { id: 'providers',  label: 'Provider Map',       icon: '⚕️', alert: false },
  { id: 'strength',   label: 'Case Strength',      icon: '⚖️', alert: false },
  { id: 'documents',  label: 'Document Library',   icon: '📁', alert: false },
  { id: 'damages',    label: 'Damages Calc.',      icon: '💰', alert: false },
  { id: 'genome',     label: 'Genome Integration', icon: '🧬', alert: false },
  { id: 'counters',   label: 'Counter Arguments',  icon: '🛡️', alert: false },
]

export default function App() {
  const [active, setActive] = useState('legal')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigate = (id) => {
    setActive(id)
    setMobileOpen(false)
  }

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const activeModule = MODULES.find(m => m.id === active)

  const NavItems = ({ collapsed }) => (
    <>
      {MODULES.map(m => (
        <button
          key={m.id}
          onClick={() => navigate(m.id)}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-all ${
            active === m.id
              ? 'bg-navy-600/70 text-white border-r-2 border-blue-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span className="text-base flex-shrink-0 leading-none">{m.icon}</span>
          {!collapsed && <span className="truncate text-xs font-medium">{m.label}</span>}
          {!collapsed && m.alert && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 animate-pulse" />
          )}
        </button>
      ))}
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 relative">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-40 flex flex-col
        bg-slate-900 border-r border-slate-800
        transition-transform duration-200 ease-out
        md:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="px-4 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">Lane v. Kayani & Rosario</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Medical Negligence Dashboard</div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          <NavItems collapsed={false} />
        </nav>
        <div className="px-4 py-3 border-t border-slate-800">
          <div className="text-[10px] text-slate-500">Kevin Lane · Local Only</div>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex ${sidebarOpen ? 'w-52' : 'w-14'} flex-shrink-0 bg-slate-900 border-r border-slate-800 flex-col transition-all duration-200`}>
        <div className="px-3 py-4 border-b border-slate-800 flex items-center gap-2 min-h-[57px]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors flex-shrink-0 text-lg"
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >⚖️</button>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white leading-tight truncate">Lane v. Kayani</div>
              <div className="text-[10px] text-slate-400 truncate">& Rosario</div>
            </div>
          )}
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          <NavItems collapsed={!sidebarOpen} />
        </nav>
        {sidebarOpen && (
          <div className="px-3 py-3 border-t border-slate-800">
            <div className="text-[10px] text-slate-500">Kevin Lane — Medical Negligence</div>
            <div className="text-[10px] text-slate-600">Local · Confidential</div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* Topbar */}
        <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-slate-900/80 border-b border-slate-800 backdrop-blur flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 18 18">
              <rect y="3" width="18" height="2" rx="1"/>
              <rect y="8" width="18" height="2" rx="1"/>
              <rect y="13" width="18" height="2" rx="1"/>
            </svg>
          </button>
          <span className="text-sm font-semibold text-white">
            {activeModule?.icon} {activeModule?.label}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] text-slate-500 hidden sm:block">Lane v. Kayani &amp; Rosario</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" title="Local only" />
          </div>
        </div>

        <div className="p-4 md:p-6">
          {active === 'timeline'  && <MedicalTimeline />}
          {active === 'ck-chart'  && <CKLabChart />}
          {active === 'labs'      && <LabPanelSummary />}
          {active === 'providers' && <ProviderMap />}
          {active === 'strength'  && <CaseStrengthMeter />}
          {active === 'documents' && <DocumentLibrary />}
          {active === 'damages'   && <DamagesCalculator />}
          {active === 'legal'     && <LegalStatusPanel />}
          {active === 'genome'    && <GenomeIntegration />}
          {active === 'counters'  && <CounterArgumentsViewer />}
        </div>
      </main>
    </div>
  )
}
