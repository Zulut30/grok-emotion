# Grok Bot — Interactive Icon

A self-contained, dependency-free showcase of the **interactive Grok bot icon** — the animated, cursor-following robot head. Open one file, move your mouse over the bot, and watch the eyes track your cursor while the character cycles through its emotional states.

| | |
|---|---|
| Output | a single `index.html` — React inlined, no server, no CDN, works from `file://` |
| Tech | SVG + React + a tiny spring-physics animation engine |
| Note | faithful reproduction of the Grok Bot icon from [x.ai/bot](https://x.ai/bot); artwork © xAI |

![Grok Bot interactive icon](preview.png)

## Demo

Open [`index.html`](index.html) in any modern browser (double-click is fine) and**move your cursor over the bot** — the eyes smoothly follow the pointer while
the character runs its state cycles:

- the headline bot cycles `waking → idle → happy → idle → curious`
- the large bot cycles `idle → curious → bored → happy → playful`

## Features

- **Cursor tracking** — the eyes follow the mouse via critically-damped spring physics, not a linear tween
- **30+ emotional states** — `idle`, `happy`, `curious`, `bored`, `sleeping`,`waking`, `thinking`, `angry`, ... plus agent morphs (`orbit`, `radar`,`progress`) and product-lifecycle states (`writing`, `sending`, `receiving`,`notifying`, ...)
- **25 eye expressions** that morph into each other with per-point ring interpolation (the "melting" transitions)
- **Ring effects** — thinking dots, orbit, radar, progress, confetti bursts,spins and bounces
- **Reduced-motion support** (`prefers-reduced-motion`)
- **Fully offline** — zero external requests

## How it works

The icon is **not a CSS animation**. It is a data-driven SVG component with a tiny physics engine, and everything runs inside one `requestAnimationFrame`
loop. Three layers:

### 1. Shapes & expressions are *data* (`src/shapes-module.js`)

- **Expressions** — 25 eye shapes, each stored as **point-rings** (~50 `[x, y]`samples per eye)
- **Geometry helpers** — `HEAD_C = 114.2705` (centre of the viewBox),`centroid`, `lerpRing` (per-point interpolation between two rings), `ringPath`
- **Shapes** — 17 head silhouettes (`blob`, `bean`, `cloud`, `shield`, `hex`,...). Each is built by `E()`, a shape builder that:
  - normalises the outline to the head's coordinate system
  - raycasts a **96-point interpolatable ring**
  - pre-computes `top` / `bottom` / `spanAt(y)` lookup tables for per-frame eye clamping
  - **brute-force searches where to place the eyes** (maximises eye area while staying close to the centre)

### 2. Motion is *physics* (`src/grokbot-module.js`)

- Every animated property is a **spring object** `{ x, v, t }` integrated with a critically-damped spring — `v += (−2ζω·v − ω²(x − target))·dt` at a fixed `1/120 s` timestep
- A **state machine** maps each state to expression indices and timing ranges (`f`, `A`, `m` tables); every state's case sets spring targets as sine
  combinations of elapsed time — e.g. `happy` squeezes the eyes into arcs,`waking` squints then pops open with a confetti burst
- A **`requestAnimationFrame` loop** re-renders the head/eye paths from the interpolated rings every frame and writes SVG attributes **directly via refs — React never re-renders during animation**
- A **particle system** spawns coloured confetti / stars on hidden layers

### 3. Interaction

When `mouseInteractive` is on, a `pointermove` listener feeds cursor coordinates into a ref; the loop maps them to a gaze direction (clamped to ±0.6 of the head width), and the spring-smoothed offset drives the eyes' `transform`.

### 4. Colours come from CSS variables

The SVG uses `.grok-bot-mark__head { fill: var(--fg) }` and`.grok-bot-mark__eye { fill: var(--bg) }`; the page provides `--fg` / `--bg`
(`hsl(var(--primary))` / `hsl(var(--background))`), so the icon inherits the host page's theme.

## Project structure

```
grok-bot-icon/
├── index.html              # the showcase — self-contained, double-click to run
├── preview.png             # screenshot used in this README
├── src/
│   ├── shapes-module.js    # annotated & formatted: shapes + expressions + geometry
│   └── grokbot-module.js   # annotated & formatted: the animation engine
├── README.md               # this file
└── README.zh-CN.md         # 中文说明
```

## Reading the annotated sources

- `src/shapes-module.js` — start with the header comment, then `E()` (the shape builder) and the `SHAPES` catalog
- `src/grokbot-module.js` — start with the header comment, then the**per-state motion `switch`**, the spring integrator `k()`, and the `requestAnimationFrame`loop `eU()`

The single-letter variable names are kept so the annotated files stay traceable to the production implementation.

## Attribution

The artwork and animation engine are a faithful reproduction of the Grok Bot icon from [x.ai/bot](https://x.ai/bot) and belong to xAI. This project is an independent technical showcase for educational purposes — do not redistribute the artwork commercially. See [LICENSE](LICENSE) — **all rights reserved**.
