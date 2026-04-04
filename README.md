# Jaymoe — Interactive Prototyping Platform

A Next.js prototyping workspace for building and testing product ideas. Prototypes live at `app/prototypes/` and are accessible from the homepage dashboard at `localhost:3000`.

Built by Benjamin Jameson (Jaymoe) — PM at Onebrief.

---

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **CSS Modules** with neon/cyberpunk aesthetic (Orbitron, Rajdhani fonts)
- **Anthropic SDK** (`@anthropic-ai/sdk`) — used by AI-powered prototypes
- **Leaflet** — used by map-based prototypes

---

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run clean      # clear .next cache
```

Requires `ANTHROPIC_API_KEY` in `.env.local` for AI-powered prototypes.

---

## Prototypes

| Prototype | Description |
|---|---|
| **Decision Support Matrix** | DSO/M operational planning tool — C&E builder, decision matrix briefing view, live tactical simulation with timeline scrubber |
| **Feedback Widget** | Floating feedback button with severity scale, file attachment, and Slack notification — production-ready for Onebrief |
| **Noted OS** | Window-based note-taking app with cyberpunk aesthetic, draggable windows, rich text, and drawing canvas |
| **Presentation Viewer** | Click-through presentation mockup with slide navigation, task organization, and collaboration UI |
| **Iran OSINT Monitor** | Live military flight tracker (ADS-B Exchange), rotating YouTube feed, X/Twitter #Iran posts, Reddit signal feed |
| **Personal Brand** | Defense-tech themed personal site with hero, projects gallery, and military HUD aesthetic |
| **Digital Piano** | Retro synthesizer with Web Audio API oscillators, waveform controls, and old Mac OS styling |
| **Confetti Button** | Interactive button with canvas-confetti explosion |

---

## Adding a Prototype

1. Copy `app/prototypes/_template/` → `app/prototypes/your-name/`
2. Add an entry to the `prototypes` array in `app/page.tsx`:

```typescript
{
  title: 'My Prototype',
  description: 'One sentence description',
  path: '/prototypes/your-name'
}
```

3. Customize `page.tsx` and `styles.module.css` in your new directory.

Static assets go in `public/prototypes/your-name/`.

---

## Project Structure

```
app/
├── prototypes/           # One directory per prototype
│   ├── _template/        # Copy this to start a new prototype
│   └── decision-support-tool/
│       └── components/   # Complex prototypes can have subcomponents
├── components/           # Shared components (e.g., FeedbackWidget)
├── api/                  # Next.js API routes
└── page.tsx              # Homepage dashboard (add prototype entries here)
public/
└── prototypes/           # Static assets per prototype
docs/                     # Design specs and planning docs
```
