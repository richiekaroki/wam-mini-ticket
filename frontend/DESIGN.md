# Design Notes: Mini Ticket Tracker

A short description of the visual choices in the frontend. The assignment values structure and judgment over visual polish, so the design is deliberately small: one page, plain CSS, no UI library.

## Approach

- **One page, three areas:** summary counts, a create-ticket form, and a ticket list.
- **Plain CSS with custom properties** in `src/style.css`. No Tailwind or component library, so every colour and spacing value lives in `:root`.
- **Theme:** a coral accent on an off-white page, with white rounded cards and thin warm-grey borders.
- **Dark mode:** follows `prefers-color-scheme`; only the variables change.

## Colour palette

| Variable | Light value | Used for |
|----------|-------------|----------|
| `--accent` | `#ef4f4a` | Large stat numbers, focus ring, hover borders |
| `--accent-strong` | `#d63a35` | Primary button fill (white text is about 4.6:1) |
| `--bg` | `#f8f7f5` | Page background |
| `--surface` | `#ffffff` | Cards and header |
| `--border` | `#ebe8e5` | Card, input and table borders |
| `--text` / `--text-secondary` | `#2f2f33` / `#6b6b6b` | Body and secondary text |
| `--success` | `#10b981` | Badge: open |
| `--info` | `#6366f1` | Badge: in progress, low priority |
| `--warning` | `#f59e0b` | Badge: medium priority |
| `--error` | `#d92d20` | Error messages, badge: high priority |
| neutral grey | `--surface-active` | Badge: closed |

The coral accent doubles as the brand colour, so errors and the "closed" status are not shown in red where possible. "Closed" uses the neutral badge so it is not read as a failure.

## Typography and spacing

- **Font:** Outfit (Google Fonts, `display=swap`) with a system-font fallback.
- **Scale:** 12 / 14 / 16 / 18 / 24 / 32 / 40 / 56 px, defined as `--font-size-*`.
- **Spacing:** a 4px-based scale from `--space-1` (4px) to `--space-10` (40px).
- **Radius:** 6 / 8 / 12 / 16px; cards use 16px.

## Components

- **Buttons:** primary (coral fill), secondary (outlined), ghost. Disabled buttons are dimmed.
- **Form controls:** shared `input`, `textarea` and `select` styles with a coral focus ring.
- **Cards:** white surface, thin border, subtle shadow.
- **Stat cards:** a large coral number over an uppercase label.
- **Table:** compact rows with a hover highlight; wraps in a scroll container on small screens.
- **Badges:** pill-shaped, uppercase; colours map to status and priority in `TicketList.tsx`.

## Layout

- Content is centred in a 1200px container.
- **Mobile:** a single column, and the three stat cards stack.
- **From 640px:** the stat cards sit in three columns.
- **From 1024px:** the create form (one third) sits beside the ticket list (two thirds), under the stats row.

## Accessibility

- Every form field has a `<label>` linked with `htmlFor`; the per-row status dropdowns have an `aria-label`.
- Keyboard focus is visible on buttons and controls.
- Animations are reduced under `prefers-reduced-motion`.
- Accent coral on white is below 4.5:1 for small text, so it is used only for large numbers and UI accents; the primary button uses the darker `--accent-strong` for that reason.

## Known limitations

- The API URL is hard-coded to `http://localhost:3000`.
- No frontend tests; the UI was checked manually in the browser.
- The page has no loading skeletons, only simple text states.