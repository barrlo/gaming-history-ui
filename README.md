# Gaming History UI

React/TypeScript application with the approved shared layout and landing page. Game cards link to the existing placeholder routes; the character roster, history chart and freshness behavior follow in separate PRs.

## Local development

Use Node 24 (`nvm use`, installing Node 24 yourself if necessary), then `npm ci` and `npm run start`. Vite serves http://localhost:5173 and proxies `/api` and `/health` to the API at http://localhost:5080. Start the API independently using its README.

For independent mock development, copy `.env.example` to `.env.local` and set `VITE_ENABLE_MOCKS=true`. Browser MSW is opt-in and development-only. The development handlers support the populated roster, all four current scores, and Aeloria detail. Mock responses use the fixed fictional September 15, 2026 fixture clock and must not be represented as today's data.

Mantine Charts and its required Recharts dependency are installed; the approved chart prototype is deferred to the next checkpoint. The shared layout provides dark mode by default, a persisted light theme, active navigation, a keyboard skip link, and a mobile drawer below Mantine’s `md` breakpoint (992px). The landing page introduces all three games and identifies PoE and PoE2 as under construction. No authentication, persistence, collection, AWS resources or deployment are implemented here.

## Contract boundary

`contracts/v1/openapi.json` is a pinned copy of API-owned OpenAPI 3.1.0, version 0.4.0-review. `npm run generate:types` generates only declarations using openapi-typescript. `src/api/types.ts` provides stable handwritten aliases, so a future move to manually maintained types need not change consumers. Axios requests and Query configuration remain handwritten.

`npm run check:generated` checks regeneration drift, and `npm run typecheck` verifies nullable scores and all three weekly discriminated states. Generated TypeScript does not validate HTTP bodies at runtime. Update the pinned contract/fixtures together through coordinated API/UI review.

The generator declares a TypeScript 5 peer dependency; TypeScript 5.9.3 is pinned intentionally. Compatible versions and all transitive packages are captured in `package-lock.json`. Runtime packages have exact versions. Revisit upgrades together with the generator and lint tooling.

The WoW roster fetches identities on entry and requests current scores independently with a maximum of three concurrent requests. Queries are keyed by character and season, revalidate on entry, and reject mismatched character/season responses. The API owns the bounded 30-minute reuse; the UI adds no second freshness timer and does not poll or refresh on focus. Individual score failures are retryable without losing other rows. Previous results retained after a failed refresh are explicitly labeled with their observation time. Scores sort descending, then character name, realm, and ID; null is distinct from zero. Between seasons, identities remain visible without current-score requests. Rows are intentionally non-clickable until character history is implemented.

## Checks

- `npm run format:check`, `npm run lint`, `npm run typecheck`
- `npm run check:generated`, `npm test`, `npm run build`
- `npm run test:coverage` runs unit/component tests with V8 coverage and requires at least 90% overall statements, branches, functions, and lines. Open `coverage/index.html` for the report; LCOV and JSON summaries are also produced.
- `npx playwright install chromium`, then `npm run test:e2e` for landing-page navigation, theme persistence, responsive layout, and keyboard/drawer checks
- With the default populated API running: `npm run test:integration` verifies roster/history/current through Vite's real proxy with browser MSW disabled. This checks transport integration, not the future full user journey.

Coverage includes untested runtime source files under `src`. It excludes the `main.tsx` bootstrap entry point, tests, test setup, development mocks, generated declarations, and the compile-only type compatibility checks. Component tests use React Testing Library with jsdom and real Mantine/Router components; browser tests remain responsible for responsive layout.

CI installs the locked dependencies and checks generation, formatting, lint, tests with the same coverage thresholds, build and the layout/landing and WoW roster browser checks. The real-API integration test is opt-in until cross-repository CI orchestration is designed. UI deployment will target existing API-provisioned infrastructure in a later checkpoint; no deployment workflow is included yet.

Vitest settings live in `vitest.config.ts`, separately from Vite development/build settings. Vitest globals are enabled, so React Testing Library automatically cleans up rendered components after each test. Keep explicit teardown hooks only for other resources, such as resetting MSW handlers or closing its server.

Routing uses React Router Data Mode: `src/routes.tsx` defines the shared route tree, `main.tsx` creates one browser router outside React rendering, and `App` renders child routes through an `Outlet`. Component tests use the same route tree with `createMemoryRouter`. TanStack Query continues to own API fetching/caching; loaders and actions are not needed for the current landing-page scope.
