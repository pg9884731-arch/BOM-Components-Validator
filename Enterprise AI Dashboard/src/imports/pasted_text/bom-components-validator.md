# Role & Aesthetic Directive
You are an elite Creative Technologist and Lead UI/UX Frontend Architect specializing in Awwwards-caliber, high-contrast industrial interfaces and dark-mode executive HUDs (inspired by Linear, Vercel, and high-end creative director portfolios like Kurosawa).

Your mission is to build a futuristic, tactile, and interactive web application called **"BOM COMPONENTS VALIDATOR // INTELLIGENCE SYSTEM"** for an enterprise manufacturing pipeline.

---

## 🎨 Design System & Aesthetic Language (NON-CARTOONISH / HARD INDUSTRIAL)

1. **Color Palette & Contrast:**
   - **Base Canvas:** Deep pitch matte black (`#090A0F`, `#0D0F17`) with subtle dot-matrix grid backgrounds.
   - **Card / Surface Layers:** Translucent dark obsidian glass (`rgba(18, 21, 31, 0.7)`) with backdrop blur (`backdrop-blur-md`) and razor-thin metallic borders (`border border-cyan-500/20` or `border-zinc-800`).
   - **Accent Highlights:** Electric Cyan (`#00F0FF`), Canary Acid Yellow (`#FACC15`), and Neon Crimson (`#FF3366`) for alerts/mismatches.
   - **Typography:** Display Monospace / Bold Neo-Grotesque headers (e.g., `font-mono tracking-wider uppercase text-zinc-100`) combined with ultra-clean technical data text.

2. **Micro-Interactions & Feel:**
   - Use **Framer Motion** for sleek layout transitions, glowing pulse rings, and spring physics.
   - Interactive hover glows on cards (`hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(0,240,255,0.15)]`).
   - Sound FX hooks ready (optional UI click/toggle audio feedback).
   - Custom sleek scrollbars and glowing data badges.

---

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router) or React + Vite (TypeScript)
- **Styling:** Tailwind CSS (v3/v4) + Tailwind Typography
- **Animation:** `framer-motion`
- **Icons:** `lucide-react`
- **Data Display:** `@tanstack/react-table` or custom virtualized grid

---

## 🖥️ Screen-by-Screen Architectural Blueprint

### Global Shell (Tactile Sidebar + Top Pipeline Tracker)
- **Brand HUD:** Animated glowing circuit chip icon, `BOM VALIDATOR // v2.4.1 ENTERPRISE` badge with active server ping indicator.
- **Top Linear Pipeline Stepper:** Step indicator with connected glowing circuit paths:
  `[01 // UPLOAD]` ➔ `[02 // AI MATRIX]` ➔ `[03 // DISCREPANCY HUD]` ➔ `[04 // OBSOLESCENCE & DIGIKEY]`.
- **Sidebar Rail:** Collapsible navigation with live notification pill counter for unresolved conflicts.

---

### Step 1: Tactical Multi-Document Ingestion Zone
A drag-and-drop dropzone designed like an aerospace telemetry portal:
- **3 Ingestion Cards:**
  1. `[CS CAD DRAWING // 2D BLUEPRINT PDF]`
  2. `[MASTER BOM // ERP SPREADSHEET (XLSX)]`
  3. `[SAP REQUIREMENT // SPECIFICATION PDF]`
- **Interactive State:** When files are dropped, trigger real-time scanning radar lines with file size, MD5 checksum, and a glowing **"INITIALIZE AI EXTRACTION ENGINE"** button.

---

### Step 2: Unified Extraction Matrix (Split-Stream Data Grid)
- **HUD Counters:** Big bold industrial metric boxes with glowing borders:
  `[ 63 CAD PARTS ]` | `[ 140 BOM ITEMS ]` | `[ 144 SAP FIELDS ]` | `[ 100% PARSE CONFIDENCE ]`
- **Tabbed Switcher:** `[ CAD Blueprint BOM ]` | `[ Excel BOM ]` | `[ SAP Spec ]` | `[ Unified Tri-Matrix ]`
- **Component Data Table:** Monospace part tags (`BLN-001`), interactive hover tooltips, material callouts, and confidence meters (high-glow green/amber bars).

---

### Step 3: Conflict & Discrepancy Battle-Station (Human-in-the-Loop)
An actionable conflict-resolution interface:
- **Discrepancy Cards:** Highlight contradictions in high-voltage Neon Crimson / Yellow:
  - **Component Title:** `IMPELLER ASSEMBLY // REF: BLN-002`
  - **Conflict Type:** `[ MATERIAL MISMATCH // CRITICAL ]`
  - **3-Way Data Comparison HUD:**
    - CAD Drawing: `ASTM A276 GR S41000`
    - BOM Excel: `ASTM A276 GR S41000`
    - SAP Data: `ASTM A276 GR S5410 (Stainless Steel)` ⚠️ *Mismatch Detected*
  - **Action Hub:** Tactile buttons with click ripples:
    - `[ ✔ AGREE / CONFIRM ]` (Neon Green border)
    - `[ ✖ REJECT / MARK VALID ]` (Crimson border)
    - `[ ⎯ BYPASS / IGNORE ]` (Muted Zinc)

---

### Step 4: DigiKey Obsolescence & Supply-Chain Telemetry
A live component intelligence dashboard:
- **Telemetry Cards:** `[ Active: 6 ]` | `[ NRND: 2 ]` | `[ Obsolete (EOL): 2 ]` | `[ RoHS Blocked: 2 ]`
- **Search & Filter HUD:** Live fuzzy filter across Part Numbers, Manufacturers, and Lifecycle.
- **Supply Table:**
  - **MPN & Description:** Clickable with copy-to-clipboard badge.
  - **Lifecycle Badge:** Glowing dynamic pills (`ACTIVE`, `NRND`, `OBSOLETE`, `EOL`).
  - **RoHS Radar:** `COMPLIANT` vs `NON-COMPLIANT`.
  - **Distributor Stock Bar:** Dynamic progress bar showing global DigiKey stock count.
  - **Datasheet Direct Stream:** `[ VIEW PDF ]` interactive button.
  - **AI Recommended Drop-In Substitute:** Suggested active replacement MPN when obsolete.

---

### Step 5: Executive Audit & Report Terminal
- **Visual Analytics:** Horizontal neon bar comparisons across sources and discrepancy breakdown graphs.
- **Export Action Hub:**
  - `[ 📥 EXPORT FULL AUDIT REPORT (.PDF) ]`
  - `[ 📊 EXPORT RESOLUTION MATRIX (.XLSX) ]`
  - `[ ⚡ EXPORT SOURCED BOM WITH REPLACEMENTS (.CSV) ]`

---

## ⚡ Implementation Instructions for AI
1. Provide completely written, modular React/TypeScript code using Tailwind CSS classes.
2. Structure state cleanly with a custom store so document uploads, extracted parts, and discrepancy resolutions dynamically update the audit counters and pipeline progress.
3. Keep the visual tone dark, ultra-sharp, high-contrast, tactile, and enterprise-grade.