# Graph Report - C3-OFFICIAL-DELIVERY  (2026-09-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 273 nodes · 461 edges · 32 communities (10 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a9bd41ee`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react
- package.json
- backendHandler.js
- OrganizerPortalModal.tsx
- App.tsx
- compilerOptions
- compilerOptions
- devDependencies
- FoundingPass.tsx
- .oxlintrc.json
- SoundSystem
- ZoomPreloader.tsx
- tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `react` - 36 edges
2. `lucide-react` - 26 edges
3. `sounds` - 23 edges
4. `framer-motion` - 23 edges
5. `compilerOptions` - 17 edges
6. `compilerOptions` - 15 edges
7. `routeApi()` - 11 edges
8. `OrganizerPortalModal()` - 11 edges
9. `TiltCard()` - 8 edges
10. `MemberRecord` - 6 edges

## Surprising Connections (you probably didn't know these)
- `c3BackendPlugin()` --calls--> `handleApiRequest()`  [EXTRACTED]
  vite.config.ts → server/backendHandler.js
- `AcceptanceLetterModalProps` --references--> `MemberRecord`  [EXTRACTED]
  src/components/AcceptanceLetterModal.tsx → src/utils/api.ts
- `OrganizerPortalModalProps` --references--> `MemberRecord`  [EXTRACTED]
  src/components/OrganizerPortalModal.tsx → src/utils/api.ts
- `server` --calls--> `handleApiRequest()`  [EXTRACTED]
  server/index.js → server/backendHandler.js
- `App()` --calls--> `fetchMemberByKey()`  [EXTRACTED]
  src/App.tsx → src/utils/api.ts

## Import Cycles
- None detected.

## Communities (32 total, 3 thin omitted)

### Community 0 - "react"
Cohesion: 0.08
Nodes (20): canvas-confetti, framer-motion, lucide-react, react, TiltCard(), TiltCardProps, ZoomPortalScrubProps, ZoomPortalTriggerProps (+12 more)

### Community 1 - "package.json"
Cohesion: 0.07
Nodes (28): dependencies, canvas-confetti, framer-motion, lucide-react, nodemailer, react, react-dom, name (+20 more)

### Community 2 - "backendHandler.js"
Cohesion: 0.15
Nodes (22): vite, @vitejs/plugin-react, DATA_FILE, __dirname, __filename, generateKeyFromPhone(), getMembers(), handleApiRequest() (+14 more)

### Community 3 - "OrganizerPortalModal.tsx"
Cohesion: 0.18
Nodes (19): AcceptanceLetterModal(), AcceptanceLetterModalProps, ApplyModal(), ApplyModalProps, OrganizerPortalModal(), OrganizerPortalModalProps, addMemberApi(), EmailConfig (+11 more)

### Community 4 - "App.tsx"
Cohesion: 0.13
Nodes (13): App(), AccreditationStrip(), CursorGlow(), EngineeringBackground(), Marquee(), ScrollProgress(), ScrollZoomPreloader(), ScrollZoomPreloaderProps (+5 more)

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 6 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 7 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @types/canvas-confetti, @types/node, @types/nodemailer (+5 more)

### Community 8 - "FoundingPass.tsx"
Cohesion: 0.24
Nodes (9): FoundingPass(), FoundingPassProps, claimPassApi(), fetchMemberByKey(), MASTER_FOUNDER_KEYS, PrintQueueItem, savePassToOrganizerQueue(), validateFounderKey() (+1 more)

### Community 9 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

## Knowledge Gaps
- **99 isolated node(s):** `TiltCardProps`, `ZoomPortalScrubProps`, `ZoomPortalTriggerProps`, `BuilderQuizProps`, `CampusSolversProps` (+94 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 154 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `package.json`, `OrganizerPortalModal.tsx`, `App.tsx`, `FoundingPass.tsx`, `ZoomPreloader.tsx`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `react` to `FoundingPass.tsx`, `package.json`, `OrganizerPortalModal.tsx`, `App.tsx`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `framer-motion` connect `react` to `package.json`, `OrganizerPortalModal.tsx`, `App.tsx`, `FoundingPass.tsx`, `ZoomPreloader.tsx`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **What connects `TiltCardProps`, `ZoomPortalScrubProps`, `ZoomPortalTriggerProps` to the rest of the system?**
  _99 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.08395989974937343 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12554112554112554 - nodes in this community are weakly interconnected._