# Lane v. Kayani & Rosario — Case Review Dashboard

A local React SPA for reviewing and presenting the medical negligence case.

## How to Run

```bash
cd dashboard
npm install        # first time only
npm run dev        # starts at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Modules

| Module | What it shows |
|--------|--------------|
| **Legal Status** | SOL countdown, pre-suit notice deadline, next actions |
| **Medical Timeline** | All events 2010–present, filterable by type & significance |
| **CK Lab Trends** | CK values charted over time with threshold bands |
| **Lab Panel Summary** | Key labs: CK, Aldolase, CMP, Lipids, Genetics, EMG, MRI |
| **Provider Map** | All providers — defendants (red), supporting (green), neutral (gray) |
| **Case Strength** | Legal scorecard per criterion per defendant |
| **Document Library** | All case documents indexed — obtained / pending / needed |
| **Damages Calculator** | Interactive economic + non-economic damages model |
| **Genome Integration** | Invitae results + Mayo Clinic upload zone |

## How to Update Data

All case data lives in `src/data/`. Edit these JSON files — no code changes needed:

| File | What to update |
|------|----------------|
| `src/data/timeline.json` | Add new medical events |
| `src/data/ck-labs.json` | Add new CK lab values |
| `src/data/providers.json` | Update provider info or add new providers |
| `src/data/documents.json` | Add new documents as they're obtained |
| `src/data/damages.json` | Update damage estimates as new info arrives |
| `src/data/case-status.json` | Update SOL status, counsel, next actions |

### Adding a CK lab value (example)

Open `src/data/ck-labs.json` and add to the `values` array:

```json
{ "date": "2026-03-15", "value": 95, "note": "Routine monitoring — Dr. Lee", "event": "office_visit" }
```

### Adding a timeline event (example)

Open `src/data/timeline.json` and add to the `events` array:

```json
{
  "id": "t037",
  "date": "2026-04-01",
  "provider": "Mayo Clinic Genetics",
  "organization": "Mayo Clinic",
  "eventType": "milestone",
  "title": "Mayo Clinic Results Received",
  "summary": "Genetic report confirms pathogenic classification of AGK and AMPD1 variants.",
  "legalSignificance": "critical"
}
```

### Updating legal status / SOL

Open `src/data/case-status.json` and update:
- `counselEngagement.status` when attorney is retained
- `preSuitNotice.status` when notice is sent
- `nextActions` — change `status` to `done` when completed

## SOL Deadlines

| Date | Event |
|------|-------|
| **Aug 6, 2025** | Primary injury — Dr. Kayani SOL starts |
| **Nov 6, 2025** | Discovery — Dr. Rosario SOL starts |
| **May 8, 2027** | Latest pre-suit notice date (90 days before primary SOL) |
| **Aug 6, 2027** | Primary SOL deadline |
| **Nov 6, 2027** | Discovery SOL deadline |

## Tech Stack

- React 18 + Vite
- Recharts (charts)
- Tailwind CSS
- JSON data files (no backend)
