# Gaming History UI

Scaffold checkpoint for the React/TypeScript application. This is a minimal navigable shell, not the finished Figma implementation. The character roster, history chart and freshness behavior are the next vertical slice.

## Local development

Use Node 24 (`nvm use`, installing Node 24 yourself if necessary), then `npm ci` and `npm run start`. Vite serves http://localhost:5173 and proxies `/api` and `/health` to the API at http://localhost:5080. Start the API independently using its README.

For independent mock development, copy `.env.example` to `.env.local` and set `VITE_ENABLE_MOCKS=true`. Browser MSW is opt-in and development-only. The scaffold handlers currently support the populated roster and Aeloria detail; expand scenario coverage with the vertical slice. Mock responses use the fixed fictional September 15, 2026 fixture clock and must not be represented as today's data.

Mantine Charts and its required Recharts dependency are installed; the approved chart prototype is deferred to the next checkpoint. Dark mode defaults, persisted light mode and a mobile drawer are functional scaffolding. No authentication, persistence, collection, AWS resources or deployment are implemented here.

## Contract boundary

`contracts/v1/openapi.json` is a pinned copy of API-owned OpenAPI 3.1.0, version 0.3.0-review. `npm run generate:types` generates only declarations using openapi-typescript. `src/api/types.ts` provides stable handwritten aliases, so a future move to manually maintained types need not change consumers. Axios requests and Query configuration remain handwritten.

`npm run check:generated` checks regeneration drift, and `npm run typecheck` verifies nullable scores and all three weekly discriminated states. Generated TypeScript does not validate HTTP bodies at runtime. Update the pinned contract/fixtures together through coordinated API/UI review.

The generator declares a TypeScript 5 peer dependency; TypeScript 5.9.3 is pinned intentionally. Compatible versions and all transitive packages are captured in `package-lock.json`. Runtime packages have exact versions. Revisit upgrades together with the generator and lint tooling.

Current and weekly data remain separate. Do not use a blanket 30-minute Query staleTime: freshness must account for provider fetch timestamps and HTTP Age/cache headers, and season mismatches must never merge. Those behaviors are not yet implemented by this scaffold.

## Checks

- `npm run format:check`, `npm run lint`, `npm run typecheck`
- `npm run check:generated`, `npm test`, `npm run build`
- `npm run test:coverage` runs unit/component tests with V8 coverage and requires at least 90% overall statements, branches, functions, and lines. Open `coverage/index.html` for the report; LCOV and JSON summaries are also produced.
- `npx playwright install chromium`, then `npm run test:e2e` for navigation/theme browser smoke
- With the default populated API running: `npm run test:integration` verifies roster/history/current through Vite's real proxy with browser MSW disabled. This checks transport integration, not the future full user journey.

Coverage includes untested runtime source files under `src`. It excludes the `main.tsx` bootstrap entry point, tests, test setup, development mocks, generated declarations, and the compile-only type compatibility checks. Component tests use React Testing Library with jsdom and real Mantine/Router components; browser tests remain responsible for responsive layout.

CI installs the locked dependencies and checks generation, formatting, lint, tests with the same coverage thresholds, build and the shell browser smoke. The real-API integration test is opt-in until cross-repository CI orchestration is designed. UI deployment will target existing API-provisioned infrastructure in a later checkpoint; no deployment workflow is included yet.

Vitest settings live in `vitest.config.ts`, separately from Vite development/build settings. Vitest globals are enabled, so React Testing Library automatically cleans up rendered components after each test. Keep explicit teardown hooks only for other resources, such as resetting MSW handlers or closing its server.
