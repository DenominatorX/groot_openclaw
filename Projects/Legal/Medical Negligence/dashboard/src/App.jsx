import { useState } from 'react'
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
  { id: 'timeline',   label: 'Medical Timeline',      icon: '📅' },
  { id: 'ck-chart',   label: 'CK Lab Trends',         icon: '📈' },
  { id: 'labs',       label: 'Lab Panel Summary',     icon: '🧪' },
  { id: 'providers',  label: 'Provider Map',          icon: '👨‍⚕️' },
  { id: 'strength',   label: 'Case Strength',         icon: '⚖️' },
  { id: 'documents',  label: 'Document Library',      icon: '📁' },
  { id: 'damages',    label: 'Damages Calculator',    icon: '💰' },
  { id: 'legal',      label: 'Legal Status',          icon: '🏛️' },
  { id: 'genome',     label: 'Genome Integration',    icon: '🧬' },
  { id: 'counters',   label: 'Counter Arguments',     icon: '🛡️' },
]

export default function App() {
  const [active, setActive] = useState('legal')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="px-3 py-4 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white p-1 rounded"
          >⚖️</button>
          {sidebarOpen && (
            <div>
              <div className="text-xs font-bold text-white leading-tight">Lane v. Kayani</div>
              <div className="text-[10px] text-slate-400">& Rosario</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {MODULES.map(m => (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                active === m.id
                  ? 'bg-brand-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-base flex-shrink-0">{m.icon}</span>
              {sidebarOpen && <span className="truncate text-xs">{m.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="px-3 py-3 border-t border-slate-800">
            <div className="text-[10px] text-slate-500">Kevin Lane — Medical Negligence</div>
            <div className="text-[10px] text-slate-600">Prepared: Nov 18, 2025</div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
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
