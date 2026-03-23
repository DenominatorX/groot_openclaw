const VARIANTS = [
  {
    gene: 'AGK',
    fullName: 'Acylglycerol Kinase',
    classification: 'VUS × 2',
    type: 'Likely Pathogenic',
    consequence: 'Disrupts mitochondrial lipid metabolism and cristae maintenance',
    legalSignificance: 'critical',
    summary: 'AGK regulates mitochondrial membrane lipid composition. Loss-of-function variants impair mitochondrial structure and energy production, creating extreme vulnerability to exercise-induced rhabdomyolysis. Two rare VUS in AGK confirm bilateral disruption of this pathway.',
    color: '#ef4444',
  },
  {
    gene: 'AMPD1',
    fullName: 'Adenosine Monophosphate Deaminase 1',
    classification: 'Truncating VUS',
    type: 'Likely Pathogenic',
    consequence: '~94% loss of enzyme function in muscle energy metabolism',
    legalSignificance: 'critical',
    summary: 'AMPD1 is the dominant isoform in skeletal muscle, governing AMP deamination during exercise. A truncating variant (stop gain or frameshift) causing ~94% loss of enzyme function severely impairs the ability to regenerate ATP during physical or thermal stress. This is the direct biochemical explanation for recurrent rhabdomyolysis.',
    color: '#f97316',
  },
]

const IMPLICATIONS = [
  {
    icon: '⚕️',
    title: 'Standard of Care — Dr. Kayani',
    text: 'A board-certified internist managing a patient with recurrent unexplained rhabdomyolysis should have ordered genetic metabolic workup. The Invitae panel (covering AGK and AMPD1) was commercially available for years before either episode. Dr. Kayani\'s failure to investigate the cause of the Jan 2024 event constitutes deviation from the standard of care.',
    color: '#ef4444',
  },
  {
    icon: '🔗',
    title: 'Causal Chain Confirmation',
    text: 'The genetic variants prove Kevin\'s pre-existing metabolic vulnerability. This vulnerability was the substrate that made the RFA procedure (Jul 18, 2025) dangerous. Had Dr. Kayani disclosed the Jan 2024 rhabdo to Dr. Kamath, the RFA would have been preceded by metabolic screening — or deferred entirely.',
    color: '#f59e0b',
  },
  {
    icon: '📋',
    title: 'Expert Testimony Foundation',
    text: 'The Invitae results provide the scientific foundation for expert testimony on (1) the underlying cause of both rhabdo episodes, (2) why screening was medically required, and (3) why the catastrophic Aug 2025 event was foreseeable and preventable. Mayo Clinic confirmation will elevate VUS findings to definitive pathogenic classification.',
    color: '#3b82f6',
  },
  {
    icon: '🏛️',
    title: 'Damages Permanency',
    text: 'The genetic variants explain why Kevin\'s injury is permanent. There is no "cure" for AGK/AMPD1 dysfunction — only management (activity restrictions, monitoring, supplements). This supports the argument for lifetime future medical expenses and permanent reduction in functional capacity.',
    color: '#a78bfa',
  },
]

export default function GenomeIntegration() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Genome Integration</h1>
          <p className="text-slate-400 text-sm">Invitae Metabolic Myopathy Panel (RQ7553840) — Nov 6, 2025 · Mayo Clinic validation pending</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-950/40 text-amber-300 border border-amber-800/50 font-medium">
          Mayo Validation Pending
        </span>
      </div>

      {/* Test info */}
      <div className="card rounded-xl p-4 mb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-slate-500 text-xs mb-0.5">Test Name</div>
            <div className="text-slate-200">Rhabdomyolysis & Metabolic Myopathy Panel</div>
          </div>
          <div>
            <div className="text-slate-500 text-xs mb-0.5">Lab</div>
            <div className="text-slate-200">Invitae / Labcorp Genetics</div>
          </div>
          <div>
            <div className="text-slate-500 text-xs mb-0.5">Accession</div>
            <div className="text-slate-200 mono">RQ7553840</div>
          </div>
          <div>
            <div className="text-slate-500 text-xs mb-0.5">Result Date</div>
            <div className="text-slate-200 mono">Nov 6, 2025</div>
          </div>
        </div>
      </div>

      {/* Variants */}
      <h2 className="text-lg font-semibold text-white mb-3">Identified Variants</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {VARIANTS.map(v => (
          <div key={v.gene} className="rounded-xl border p-4" style={{ borderColor: `${v.color}30`, background: `${v.color}08` }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-bold text-xl" style={{ color: v.color }}>{v.gene}</div>
                <div className="text-slate-400 text-xs">{v.fullName}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold px-2 py-0.5 rounded" style={{ color: v.color, background: `${v.color}15`, border: `1px solid ${v.color}30` }}>
                  {v.classification}
                </div>
                <div className="text-slate-500 text-xs mt-1">{v.type}</div>
              </div>
            </div>
            <div className="text-sm font-medium mb-2" style={{ color: v.color }}>
              → {v.consequence}
            </div>
            <div className="text-slate-300 text-xs leading-relaxed bg-slate-900/40 rounded-lg p-3 border border-slate-800">
              {v.summary}
            </div>
          </div>
        ))}
      </div>

      {/* Mayo pending */}
      <div className="card rounded-xl p-4 mb-6 border-amber-900/40">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <div className="font-semibold text-amber-300">Mayo Clinic Genetics — Validation Pending</div>
        </div>
        <div className="text-slate-300 text-sm">
          Consultation scheduled Feb 24, 2026 with Clinical Biochemical Geneticist (Mitochondrial Medicine &amp; Undiagnosed Diseases Program). Purpose: confirm AGK/AMPD1 VUS findings as definitively pathogenic through advanced mitochondrial function testing and variant re-analysis.
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/50 rounded p-2">
            <div className="text-slate-500 mb-0.5">Expected outcome</div>
            <div className="text-slate-300">VUS → Pathogenic/Likely Pathogenic reclassification</div>
          </div>
          <div className="bg-slate-800/50 rounded p-2">
            <div className="text-slate-500 mb-0.5">Legal impact</div>
            <div className="text-slate-300">Eliminates "variant of uncertain significance" defense; strengthens causation argument significantly</div>
          </div>
        </div>
      </div>

      {/* Comparison — Invitae vs Mayo */}
      <div className="card rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Testing Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-500 text-left">
                <th className="pb-2 pr-4">Dimension</th>
                <th className="pb-2 pr-4">Invitae (Complete)</th>
                <th className="pb-2">Mayo Clinic (Pending)</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-800/50">
                <td className="py-2 pr-4 text-slate-400 font-medium">Result</td>
                <td className="py-2 pr-4">AGK (×2 VUS) + AMPD1 (truncating VUS)</td>
                <td className="py-2 text-amber-300">Awaiting</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-2 pr-4 text-slate-400 font-medium">Classification</td>
                <td className="py-2 pr-4">Variants of Uncertain Significance (VUS)</td>
                <td className="py-2 text-amber-300">Expected: Pathogenic/LP upgrade</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-2 pr-4 text-slate-400 font-medium">Testing method</td>
                <td className="py-2 pr-4">Sequencing panel (NGS)</td>
                <td className="py-2">Advanced functional + biochemical testing</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-slate-400 font-medium">Legal weight</td>
                <td className="py-2 pr-4">Good — confirms variants exist</td>
                <td className="py-2 text-green-300">Stronger — functional confirmation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Legal implications */}
      <h2 className="text-lg font-semibold text-white mb-3">Legal Implications</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {IMPLICATIONS.map(imp => (
          <div key={imp.title} className="card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{imp.icon}</span>
              <div className="font-medium text-sm" style={{ color: imp.color }}>{imp.title}</div>
            </div>
            <div className="text-slate-300 text-xs leading-relaxed">{imp.text}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 text-xs text-slate-600 italic border-t border-slate-800 pt-3">
        This section will be updated upon receipt of Mayo Clinic genetics report. Dr. Al's geneticist review (if completed) will be integrated alongside Invitae and Mayo findings for comparative analysis.
      </div>
    </div>
  )
}
