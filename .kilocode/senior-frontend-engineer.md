---
name: modern-react-ui
description: >
  Build production-grade, visually distinctive React + TypeScript UI components and pages using the modern premium component ecosystem: shadcn/ui, Aceternity UI, Origin UI, React Bits, Bento Grids, and Three.js. Use this skill for ANY frontend task involving React components, landing pages, dashboards, UI sections, animations, 3D elements, or interactive interfaces. Trigger whenever the user asks to build, design, redesign, create, or improve any UI — even if they don't explicitly name these libraries. This skill ensures output is memorable, technically correct, and never generic.
---

# Modern React UI Skill

You are building **production-grade React + TypeScript UI** that is visually distinctive, component-library-aware, and never generic.

Read `references/libraries.md` before writing any code — it contains import paths, usage patterns, and gotchas for every library in this stack.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | React 18+ with TypeScript |
| Base Components | shadcn/ui |
| Premium Animations | Aceternity UI |
| Utility Components | Origin UI |
| Motion & Microinteractions | React Bits |
| Layout | Bento Grid |
| 3D / WebGL | Three.js (via @react-three/fiber + @react-three/drei) |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |

---

## Design Thinking (Do This First)

Before writing a single line of code, commit to a **design direction**:

1. **Purpose** — What does this UI do? Who uses it?
2. **Tone** — Pick one and commit: minimal/refined, dark luxury, glassmorphism, brutalist, editorial, retro-futuristic, soft organic, high-contrast geometric
3. **Memorable Moment** — What is the ONE thing the user will remember? A scroll animation, a 3D element, a grid reveal, a morphing card?
4. **Library Selection** — Which libraries serve this moment? Don't use all of them. Pick what fits.

---

## Component Library Decision Matrix

Use this to decide which library to reach for:

| Need | Use |
|---|---|
| Form, dialog, table, dropdown, toast | shadcn/ui |
| Hero sections, spotlight effects, moving borders, text reveal, card hover effects | Aceternity UI |
| Stat cards, avatar stacks, badges, input groups, timelines | Origin UI |
| Magnetic buttons, text scramble, blur-in, smooth cursor, stagger animations | React Bits |
| Feature grids, dashboard layouts, mixed-size card layouts | Bento Grid |
| 3D background, floating objects, particle systems, product viewers | Three.js / R3F |

Do NOT mix libraries randomly. Choose based on the effect needed.

---

## Code Standards

### File Structure
```
/components
  /ui          ← shadcn primitives (never modify directly)
  /sections    ← page sections (Hero, Features, Pricing, etc.)
  /shared      ← reusable custom components
/app
  /page.tsx    ← page composition only, no logic
```

### TypeScript Rules
- All props must be typed with interfaces, never `any`
- Use `cn()` from `lib/utils` for conditional classNames
- Server Components by default; add `"use client"` only when using hooks or browser APIs

### Tailwind Rules
- Use CSS variables for theme colors, never hardcode hex in classNames
- Dark mode via `dark:` prefix, not manual toggling
- Responsive: mobile-first, use `sm:` `md:` `lg:` prefixes

### Animation Rules
- Prefer CSS transitions for simple hover states
- Use Framer Motion (bundled with Aceternity) for enter/exit animations
- Use React Bits for interactive/magnetic effects
- Use Three.js only when 2D cannot achieve the effect
- Always add `prefers-reduced-motion` fallback

---

## Aceternity UI Patterns

Read `references/libraries.md` → Aceternity section for full import paths.

Key components and when to use them:
- `<BackgroundBeams />` — hero section backgrounds
- `<SpotlightNew />` — dark hero with spotlight effect
- `<MovingBorder />` — CTA button with animated border
- `<CardHoverEffect />` — feature card grids
- `<TextGenerateEffect />` — animated headline reveals
- `<InfiniteMovingCards />` — testimonial / logo carousels
- `<BentoGrid />` + `<BentoGridItem />` — feature showcase layouts
- `<LampContainer />` — dramatic section dividers
- `<Meteors />` — dark section background accents
- `<TracingBeam />` — scroll-driven content reveal

**Install:** `npx shadcn@latest add "https://ui.aceternity.com/r/[component-name].json"`

---

## Origin UI Patterns

Origin UI is for **utility-first, polished UI blocks** — inputs, stat cards, notifications, user flows.

- Import directly from `@/components/ui` after adding via CLI
- Best for: auth forms, dashboards, settings pages, data tables
- Pairs cleanly with shadcn/ui — no conflicts

**Install:** `npx shadcn@latest add "https://originui.com/r/[component-name].json"`

---

## React Bits Patterns

React Bits provides **interaction-layer components** — effects on top of content.

Key uses:
- `<MagneticButton>` — hero CTAs
- `<TextScramble>` — hover-triggered text effects
- `<BlurIn>` — staggered section reveals
- `<SmoothCursor>` — custom cursor for landing pages
- `<CountUp>` — animated stat numbers

**Install:** `npm install @vite-react-bits/components` or copy from reactbits.dev

Always wrap in `"use client"` — all React Bits components are client-side.

---

## Bento Grid Patterns

Use for **feature showcase sections** and **dashboard overview layouts**.

```tsx
// Standard bento pattern

  {items.map((item) => (
    <BentoGridItem
      key={item.title}
      title={item.title}
      description={item.description}
      header={item.header}
      icon={item.icon}
      className={item.className} // use col-span-2 for wide cards
    />
  ))}

```

Rules:
- Minimum 2 different card sizes in a bento grid
- Headers should be visual (image, animation, icon cluster) not text
- Always set explicit `className` for grid spanning

---

## Three.js / React Three Fiber Patterns

Only use for:
- Animated 3D hero backgrounds
- Floating/rotating product models
- Particle systems
- Abstract geometric animations

```tsx
"use client"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Float } from "@react-three/drei"

export function Scene() {
  return (
    
      
      
        
          
          
        
      
      
    
  )
}
```

Always wrap Canvas in a sized container (`h-screen`, `h-[500px]`, etc.).
Never use Three.js for decorative elements that CSS can handle.

---

## shadcn/ui Usage

shadcn is the **base layer** — use it for all structural UI:

```bash
npx shadcn@latest add button card dialog form input table toast
```

Never override shadcn component internals. Extend via `className` prop with `cn()`.

```tsx
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

<Button className={cn("w-full", isLoading && "opacity-50 cursor-not-allowed")}>
  Submit

```

---

## Output Format

When building a component or page, always output:

1. **Design Decision** (2–3 sentences: tone, memorable moment, library choices)
2. **Component Code** (complete, runnable, no pseudocode)
3. **Install Commands** (exact CLI commands for any non-standard dependencies)
4. **Usage Example** (how to drop this into a page)

If building a full page: output section by section, not as one massive block.

---

## Anti-Patterns — Never Do These

- No generic purple gradient on white background
- No Inter/Roboto/Arial as primary display font — use something with character
- No "card grid with icon, title, description" without visual hierarchy or animation
- No mixing all 6 libraries in one component
- No inline styles — use Tailwind
- No `useState` for things that should be URL state
- No Three.js for 2D effects
- No placeholder lorem ipsum in final output — write real copy that fits the context
- No components without TypeScript interfaces on all props

---

## Quality Bar

Before outputting any code, internally ask:

> "Would a senior product designer at a Series A startup be proud to ship this?"

If not — add one more intentional detail: better spacing, a micro-animation, a more deliberate font pairing, a stronger color contrast moment.