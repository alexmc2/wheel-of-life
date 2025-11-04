# Repository Guidelines

## Project Structure & Module Organization
The app follows the Next.js App Router. Core routing lives in `app/`, with `layout.tsx` defining global chrome and `page.tsx` hosting the Wheel of Life experience. Shared React building blocks sit in `components/`; use `components/ui/` for generic UI primitives and `components/wheel-chart.tsx` for chart logic. Utility helpers belong under `lib/`, and static assets (icons, manifest, fonts) go into `public/`. Global styles are defined in `app/globals.css`; favor Tailwind classes for component-level styling.

## Build, Test, and Development Commands
- `npm run dev`: launch the hot-reloading dev server at `http://localhost:3000`.
- `npm run build`: produce the production bundle; run before publishing changes.
- `npm run start`: serve the built output locally for smoke-testing.
- `npm run lint`: run ESLint using the Next.js config; resolve all warnings before review.

## Coding Style & Naming Conventions
Write TypeScript with ES module syntax and React function components. Maintain two-space indentation and trailing commas as seen in existing files. Prefer named exports for reusable modules and PascalCase component names (`Button`, `WheelChart`). Compose UI with Tailwind utility classes; add shared styles via tokens rather than ad-hoc CSS. Run `npm run lint` before pushing; configure your editor to respect the repo ESLint settings.

## Testing Guidelines
Automated tests are not yet configured. When contributing features, include a plan for coverage (component tests with React Testing Library or integration checks) and document manual validation steps in the PR. Co-locate future tests beside the code under a `__tests__` folder or `.test.tsx` suffix to keep the structure discoverable.

## Commit & Pull Request Guidelines
Existing history uses short, descriptive messages (“Initial commit from Create Next App”). Continue with concise imperative summaries, e.g., `Add wheel chart tooltip`. Group related changes per commit. PRs should describe the problem, solution, and visual changes (attach screenshots for UI tweaks) and reference any related issues. Confirm `npm run lint` and the production build succeed before requesting review.
