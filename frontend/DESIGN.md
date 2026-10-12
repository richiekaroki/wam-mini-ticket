# Design Notes: Mini Ticket Tracker

The frontend's visual system: what it is, why it looks this way, and how to keep
changes consistent with it. The direction follows
`docs/Lodwar_Ticket_Tracker_UI_Recommendations.docx` — a premium dark workspace,
one warm amber accent, compact chrome, refined ticket rows and strong
empty/loading/error states.

## Direction in one paragraph

A **service-desk console**: a committed dark workspace (no light mode, no
toggle) where amber is the only brand colour and everything else is structure.
The page opens with an editorial headline instead of a marketing hero, then a
single summary strip that reads like an ops board, then the two work surfaces —
file a ticket, work the queue. Colour is spent only where it carries meaning:
status, priority, focus, and the one primary action.

## File map

| File | Role |
|------|------|
| `index.html` | Font loading (preconnect + Google Fonts), title, meta, theme-color |
| `src/style.css` | The whole design system: tokens, layout, components, states, motion |
| `src/App.tsx` | Top bar, page intro, summary strip placement, workspace grid, footer |
| `src/components/TicketStats.tsx` | Summary strip (3 segments, skeleton + error states) |
| `src/components/TicketList.tsx` | Queue: filter, table, skeleton/empty/error states, pagination |
| `src/components/CreateTicket.tsx` | Form: hints, validation, success note, focus hand-off |
| `public/favicon.svg` | Amber ticket glyph on a dark rounded square |

There is no CSS framework and no component library: plain CSS with custom
properties in one file, so every colour and spacing value lives in `:root`.

## Colour palette

| Token | Value | Used for |
|-------|-------|----------|
| `--bg` | `#17191d` | Page canvas (off-black with a green-blue cast) |
| `--bg-deep` | `#131519` | Top bar, footer |
| `--surface` | `#22252b` | Panels and the summary strip |
| `--surface-inset` | `#1b1e23` | Inputs and textareas (recessed into panels) |
| `--border` / `--border-soft` | `#3a3d45` / `#2e323a` | Controls / panel dividers |
| `--text` / `--text-2` / `--text-3` | `#eceef1` / `#a7adb8` / `#858b96` | Body, secondary, muted (≈14:1, 8:1, 5:1 on canvas) |
| `--accent` | `#f59e0b` | The one brand colour: primary button, focus ring, "open" |
| `--accent-ink` | `#1a1305` | Text on amber (≈9:1) |
| `--st-progress` | `#60a5fa` | Status: in progress |
| `--st-closed` | `#4ade80` | Status: closed |
| `--prio-medium` / `--prio-high` | `#fb923c` / `#f87171` | Priority meter, level 2 / 3 |
| `--danger` | `#f87171` | Error alerts only |

Rules the palette follows:

- **One accent.** Amber never appears except as brand/action, "open" status and
  focus. Status and priority colours are semantic, not decorative.
- **No pure black or white.** The canvas is tinted off-black; text is soft white.
- **Colour is never alone.** Every status badge carries a dot + word; every
  priority meter carries 1–3 bars + a word; errors are words in an alert.
- **Shadows are tinted** (dark blue-grey, low opacity) so cards sit on the
  canvas instead of punching holes in it. Panels mostly separate by border.

## Typography

- **Archivo** (variable, width axis) for display and UI. Headlines and the
  summary counts use the **expanded** instance (`font-stretch: expanded`,
  125%) at weight 800 — signage-like, that's the personality carrier. UI text
  uses 400–700 at normal width.
- **IBM Plex Mono** for data: eyebrows, ticket IDs (`#0061`), dates, counts,
  pagination, footer. Tabular figures everywhere numbers align
  (`font-variant-numeric: tabular-nums`).
- Scale: 11 / 12 / 13 / 14 / 15 / 16 / 17 / h1 `clamp(2rem, 4.4vw, 2.875rem)`.
- Headlines are tight (`letter-spacing: -0.015em`, `text-wrap: balance`);
  mono labels are wide (`0.12–0.14em`) and uppercase.
- Loaded in `index.html` with `preconnect` + `display=swap`, so text renders
  with the system fallback immediately.

## Layout

```
┌ top bar: mark · name · [LODWAR SERVICES] ········ [+ New ticket] ┐ sticky
│ intro: SERVICE DESK — QUEUE                                     │
│        Tickets, under control.                                  │
│        File new requests, watch the queue…                      │
│                                                                 │
│ ┌ summary strip ──────────────────────────────────────────────┐ │
│ │ ● OPEN      ◷ IN PROGRESS    ✓ CLOSED   (2px status rule)   │ │
│ │   2            1                1       ← expanded numerals│ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌ workspace: form (≈1/3) ─┬─ queue (≈2/3) ────────────────────┐ │
│ │ eyebrow + h2            │ eyebrow + h2 · 4 tickets · filter │ │
│ │ title / description     │ TICKET TITLE STATUS PRIORITY      │ │
│ │ priority / status       │ ▌#0061 title… ● Open ▮▮▯  [sel]   │ │
│ │ [Create ticket]         │ …                                 │ │
│ └─────────────────────────┴── Previous · Page 1 of 1 · Next ──┘ │
└ footer: Mini Ticket Tracker ············· NestJS · React · PostgreSQL
```

- Container: 1200px max, centred. Breakpoints: **1024px** (workspace collapses
  to one column), **767px** (summary strip becomes label-left/count-right rows,
  pager stacks, panel padding tightens), `pointer: coarse` (every control goes
  to a 44px target).
- The queue table sits in an in-panel scroll container (`min-width: 640px`),
  so the page itself never scrolls horizontally on small screens.

## Signature elements

1. **Summary strip** — one band, three segments, hairline dividers, a 2px rule
   in each status colour along the top edge, oversized expanded numerals. It is
   the hero: the queue state is the most important thing on the page.
2. **Status rails** — every queue row carries a 3px rail in its status colour
   down the left edge (`row-open` / `row-in_progress` / `row-closed`), so the
   list reads as a board at a glance.
3. **Priority meter** — 1–3 small bars plus the word (`Low` / `Medium` /
   `High`), coloured by level. Replaces the usual coloured pill.
4. **Meta line** — each row shows `date · description` in mono/muted text under
   the title; the description ellipsizes (`max-width: 24ch` also keeps the
   column shrinkable, which is what lets the table fit without horizontal
   scroll on desktop).

## States

| State | Treatment |
|-------|-----------|
| Loading (stats) | Skeleton block in each segment (no fake zeros) |
| Loading (queue) | 5 shimmer rows matching the column shapes |
| Empty, no filter | Ticket glyph + "The queue is clear" + **Create a ticket** (focuses the form) |
| Empty, filtered | "No open / in progress / closed tickets" + **Clear filter** |
| Error | Inline alert (`role="alert"`) with **Try again**; the summary has its own |
| Success | `role="status"` note: "Ticket #0061 created — it is now in the queue." (auto-dismisses after 6s) |
| Refetch | `useTransition` keeps current rows visible and dims the stack to 60% |

## Motion

- Staggered entry on load: intro → strip → panels rise 10px with a 40–240ms
  stagger (`--d` custom property).
- Hover/focus/active transitions at 150ms; buttons press down 1px; rows tint on
  hover; skeleton shimmer 1.4s.
- `prefers-reduced-motion: reduce` kills all of it (single global override), and
  the "New ticket" scroll falls back to instant.

## Accessibility

- Skip link first in tab order, then top-bar button → form → queue.
- Every field has a real `<label>`; row selects have `aria-label`s naming the
  ticket; the filter label is visually hidden but present.
- Focus is always visible: amber 2px ring (`:focus-visible`), amber border +
  soft ring on inputs. Nothing removes outlines.
- Contrast: body text ≈14:1, secondary ≈8:1, muted ≈5:1, amber-on-ink ≈9:1 —
  all above WCAG AA.
- Semantic HTML: `<header> / <main> / <section> / <nav> / <footer>`, `<time>`
  for dates, `scope="col"` headers, `aria-busy` during refetch.
- Touch targets are ≥44px on coarse pointers.

## Known limitations

- The API URL is hard-coded to `http://localhost:3000` in
  `src/services/ticket.service.ts`.
- No frontend unit tests; behaviour was verified in a real browser (see below).
- On screens under ~700px the queue table scrolls horizontally inside its panel
  (title and status stay visible; priority and status controls require a swipe).

## How this was verified

Tested end-to-end in a browser (Playwright MCP) against the running NestJS API:
create + validation + success note, status updates via `PATCH` (summary counts
refresh), status filter with empty state and Clear filter, pagination across 3
pages (API mocked in-browser to avoid polluting the database), simulated 500s
with Try-again recovery, skip-link/tab order, hover and focus states, font
loading (Archivo expanded + Plex Mono), and responsive layouts at 1440px and
390px with no page-level horizontal overflow. Screenshots:
`design/desktop-final.png`, `design/mobile-final.png`. Zero console errors.
