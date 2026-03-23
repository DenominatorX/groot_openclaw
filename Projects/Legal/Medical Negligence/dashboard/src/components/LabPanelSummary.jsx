// Lab Panel Summary — shows CK, Aldolase, CMP and other key labs
// Data sourced from case documents. Update values in the labs array below as new results arrive.

const LABS = [
  {
    panel: 'Creatine Kinase (CK)',
    icon: '💥',
    current: { value: '80', unit: 'U/L', date: 'Nov 11, 2025', status: 'normal' },
    peak: { value: '>22,052', unit: 'U/L', date: 'Aug 5-6, 2025', status: 'crisis', note: 'Second catastrophic rhabdo' },
    baseline: { value: '95', unit: 'U/L', date: 'Jul 23, 2024', status: 'normal' },
    normalRange: '35–232 U/L',
    significance: 'PRIMARY BIOMARKER. Two near-fatal rhabdomyolysis episodes. Dr. Kayani failed to order CK monitoring despite prior episode.',
  },
  {
    panel: 'Aldolase',
    icon: '🔬',
    current: { value: 'N/A', unit: '', date: '', status: 'unknown' },
    peak: { value: '153.3', unit: 'U/L', date: 'Aug 5, 2025', status: 'crisis', note: 'Elevated reference <8.1 — extreme muscle damage' },
    baseline: { value: '<8.1', unit: 'U/L', date: 'Reference', status: 'normal' },
    normalRange: '<8.1 U/L',
    significance: 'Aldolase 153.3 at second rhabdo confirms massive muscle breakdown. Supports metabolic myopathy diagnosis.',
  },
  {
    panel: 'Comprehensive Metabolic Panel (CMP)',
    icon: '🧬',
    current: { value: 'Cr 1.31 / Lactate 2.3', unit: '', date: 'Oct 21, 2025', status: 'elevated', note: 'Mildly elevated creatinine and plasma lactate — consistent with metabolic dysfunction' },
    peak: { value: 'Abnormal', unit: '', date: 'Aug 2025', status: 'danger', note: 'Acute kidney stress during rhabdo' },
    baseline: { value: 'Normal', unit: '', date: 'Various 2024', status: 'normal' },
    normalRange: 'Cr: 0.7–1.2 mg/dL; Lactate: 0.5–2.0 mmol/L',
    significance: 'Elevated plasma lactate (2.3) supports mitochondrial energy dysfunction. Consistent with AGK/AMPD1 variants.',
  },
  {
    panel: 'Lipid Panel',
    icon: '🫀',
    current: { value: 'LDL 122, non-HDL 140', unit: 'mg/dL', date: 'Nov 11, 2025', status: 'elevated', note: 'High LDL and non-HDL — cardiovascular risk' },
    peak: { value: 'LDL 134', unit: 'mg/dL', date: 'Sep 2012', status: 'elevated' },
    baseline: { value: 'LDL ~125', unit: 'mg/dL', date: 'Chronic', status: 'elevated' },
    normalRange: 'LDL <100 mg/dL (optimal)',
    significance: 'Chronically elevated LDL documented since 2013. Noted repeatedly but not aggressively treated.',
  },
  {
    panel: 'HbA1c',
    icon: '🍬',
    current: { value: '5.3', unit: '%', date: 'Jan 2025', status: 'normal', note: 'Borderline — normal' },
    peak: { value: '5.4', unit: '%', date: 'Sep 2023', status: 'normal', note: 'Increased diabetes risk' },
    baseline: { value: '5.3', unit: '%', date: 'Chronic', status: 'normal' },
    normalRange: '<5.7%',
    significance: 'Borderline prediabetic range. Not directly implicated in negligence claims.',
  },
  {
    panel: 'Genetic Testing — Invitae Panel (RQ7553840)',
    icon: '🧬',
    current: { value: 'AGK (×2 VUS) + AMPD1 (truncating)', unit: '', date: 'Nov 6, 2025', status: 'critical', note: 'Scientific proof of underlying metabolic dysfunction' },
    peak: { value: 'N/A', unit: '', date: '', status: 'unknown' },
    baseline: { value: 'Not tested prior', unit: '', date: '', status: 'unknown' },
    normalRange: 'No pathogenic variants expected',
    significance: 'AGK variants affect mitochondrial lipid metabolism. AMPD1 truncating mutation causes ~94% loss of enzyme function. This IS the underlying cause of both rhabdo episodes. Confirmed by Invitae, pending Mayo Clinic validation.',
  },
  {
    panel: 'Myositis / MSA Panel',
    icon: '🔴',
    current: { value: 'Negative', unit: '', date: 'Sep 26, 2025', status: 'normal', note: 'Rules out inflammatory myositis' },
    peak: { value: 'Negative', unit: '', date: 'Aug 29, 2025', status: 'normal' },
    baseline: { value: 'N/A', unit: '', date: '', status: 'unknown' },
    normalRange: 'Negative',
    significance: 'Negative MSA Panel confirms this is metabolic (not inflammatory/autoimmune) myopathy. Strengthens genetic/mitochondrial causation theory.',
  },
  {
    panel: 'Brain MRI / MR Angiography',
    icon: '🧠',
    current: { value: 'Normal', unit: '', date: 'Nov 11, 2025', status: 'normal', note: 'No stroke, demyelination, or structural cause' },
    peak: { value: 'N/A', unit: '', date: '', status: 'unknown' },
    baseline: { value: 'N/A', unit: '', date: '', status: 'unknown' },
    normalRange: 'Normal',
    significance: 'Rules out brain/neurological structural cause for symptoms. Permanent functional impairment is metabolic, not structural.',
  },
  {
    panel: 'EMG / Nerve Conduction Study',
    icon: '⚡',
    current: { value: 'Normal', unit: '', date: 'Nov 11, 2025', status: 'normal', note: 'No neuropathy or inflammatory myopathy on standard testing' },
    peak: { value: 'N/A', unit: '', date: '', status: 'unknown' },
    baseline: { value: 'N/A', unit: '', date: '', status: 'unknown' },
    normalRange: 'Normal',
    significance: 'Normal EMG definitively rules out structural/inflammatory causes. Confirms metabolic etiology — critical for legal argument.',
  },
]

const STATUS_STYLE = {
  normal:   'bg-green-900/40 text-green-300 border-green-800',
  elevated: 'bg-yellow-900/40 text-yellow-300 border-yellow-800',
  danger:   'bg-orange-900/40 text-orange-300 border-orange-800',
  crisis:   'bg-red-900/40 text-red-300 border-red-800',
  critical: 'bg-red-900/60 text-red-200 border-red-700',
  unknown:  'bg-slate-800 text-slate-500 border-slate-700',
}

function StatusBadge({ status, value, unit, date, note }) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-center ${STATUS_STYLE[status] || STATUS_STYLE.unknown}`}>
      <div className="font-bold text-sm">{value} <span className="text-xs font-normal opacity-70">{unit}</span></div>
      {date && <div className="text-xs opacity-60 mt-0.5">{date}</div>}
      {note && <div className="text-xs opacity-70 mt-1">{note}</div>}
    </div>
  )
}

export default function LabPanelSummary() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Lab Panel Summary</h1>
      <p className="text-slate-400 text-sm mb-6">Key lab results with traffic-light status. Current · Peak · Baseline comparison.</p>

      <div className="grid grid-cols-1 gap-4">
        {LABS.map((lab, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{lab.icon}</span>
                  <span className="font-semibold text-white text-sm">{lab.panel}</span>
                </div>
                <div className="text-slate-500 text-xs mt-1">Normal: {lab.normalRange}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <div className="text-xs text-slate-500 mb-1 text-center">CURRENT</div>
                <StatusBadge {...lab.current} />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1 text-center">PEAK</div>
                <StatusBadge {...lab.peak} />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1 text-center">BASELINE</div>
                <StatusBadge {...lab.baseline} />
              </div>
            </div>

            <div className="text-xs text-slate-400 bg-slate-800/50 rounded p-2 border border-slate-700">
              {lab.significance}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
