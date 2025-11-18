# Wheel of Life

A guided "Wheel of Life" self-audit inspired by Stay Nimble's coaching resources. The experience walks someone through rating eight life areas, capturing reflections, visualising the current balance, and exporting a coach-ready PDF report that can be revisited each month.

## Key features
- **Step-by-step assessment** – Score Health, Relationships, Career, Money, Lifestyle, Personal Growth, Attitude, and Social Life with contextual prompts and granular (0-10) options.
- **Real-time wheel visualisation** – `components/wheel-chart.tsx` renders a responsive SVG wheel that adapts label stacking, spacing, and dots for compact layouts.
- **Reflection capture** – Inline notes per category plus eight deeper prompts once the wheel is complete, helping users document insights for coaching.
- **Local persistence** – Scores, notes, prompt answers, and the current step are stored in `localStorage` so progress survives refreshes or browser restarts.
- **PDF export** – Generates an A4 PDF with the wheel graphic, per-category notes, and reflection responses using `jspdf`, embedding the Stay Nimble brand font from `public/fonts/AlfaSlabOne-Regular.ttf`.
- **Reset + analytics** – Quick “Start again” reset and lightweight traffic insights via `@vercel/analytics`.

## Getting started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run the dev server**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 to use the wheel.

### Available scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Launches the hot-reloading Next.js dev server. |
| `npm run build` | Creates the production build; run before deploying. |
| `npm run start` | Serves the production build locally for smoke tests. |
| `npm run lint` | Runs ESLint with the Next.js (core web vitals + TS) config. |

> **Requirements:** Node.js 18.18+ (per Next.js 16) and npm 10+ are recommended. Network access is not required beyond the initial install; fonts and assets ship in `public/`.

## Application flow
1. **Assessment steps** – The primary card presents one category at a time with descriptive text and a rating grid. Continue buttons stay disabled until a score is picked.
2. **Contextual notes** – Each in-progress category lets the user jot optional thoughts (saved instantly).
3. **Wheel preview** – A sticky sidebar shows the SVG wheel updating in real time while scores remain incomplete.
4. **Completion view** – After all areas are scored, the UI swaps to a summary that includes the full-size wheel, category list with notes, reflection prompts, download/reset buttons, and CTA back to Stay Nimble.
5. **PDF report** – “Download PDF” re-renders the wheel off-screen, converts it to a PNG for embedding, and prints the notes + prompt answers with pagination-aware layout.
6. **Persistence & reset** – Progress automatically reloads from `localStorage`; “Start again” clears state and storage.

## Project structure
```
app/
  layout.tsx        # Root layout, fonts, and Vercel analytics
  page.tsx          # Entire wheel flow, state, persistence, PDF logic
components/
  wheel-chart.tsx   # Responsive SVG wheel visualisation
  ui/               # Button, Card, and Textarea primitives
  theme-*           # (currently unused) Theme context + toggle prototype
lib/
  utils.ts          # `cn` helper for composing class names
public/
  fonts/Alfa...ttf  # Stay Nimble display font embedded in PDFs
  *.svg             # Hero and illustrative assets
```
The app uses the Next.js App Router with Tailwind CSS v4, but styles are applied mostly via component-level utility classes.

## Development notes
- **State shape:** `scores` (number/null per category) and `reflections` (string per category + prompt) live in React state and persist to `localStorage` under the `wheel-of-life-data` key.
- **Responsive sizing:** The chart size recalculates on resize events; guard rails keep SVG labels legible on small screens.
- **PDF font embedding:** `app/page.tsx` loads `public/fonts/AlfaSlabOne-Regular.ttf`, encodes it to Base64, and registers it with jsPDF to render branded headings.
- **Brand credit:** All Stay Nimble mentions link back to https://staynimble.co.uk/for-individuals/.

## Testing & validation
Automated tests are not configured yet. Before shipping changes:
- Run `npm run lint` and `npm run build`.
- Manually validate:
  1. Step through all eight categories, confirming progress % and button enabling logic.
  2. Refresh the page midway to ensure scores/notes reload from storage.
  3. Complete the flow, check that the reflection prompts appear, and download the PDF.
  4. Review the generated PDF (wheel image, scores, prompt answers, Stay Nimble link).
  5. Click “Start again” to confirm state and storage clear.

**Future coverage ideas:**
- Component tests for `WheelChart` (label wrapping, grid rendering) using React Testing Library + jest-dom snapshots.
- Integration tests for the wizard flow (step advancement, persistence, completion gating) using Playwright or Cypress.
- Smoke test that spies on `localStorage` to verify state serialization, and a unit test for the PDF export helper when jsdom becomes available.

## Credits
- Stay Nimble – exercise inspiration and font family for branded callouts.
- Vercel / Next.js – application scaffold with App Router + Analytics.
