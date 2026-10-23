# Unit-test conventions

- Keep exactly one top-level `describe` per test file. Nested suites can group scenarios. The ESLint Vitest and Playwright rules enforce the single top-level suite for their respective files.
- Prefer `toStrictEqual` for object and array comparisons. Both test plugins enforce this preference.
- Assert rendered content with Testing Library queries and DOM matchers. For ordered collections, get the elements, assert their length, then use indexed `toHaveTextContent` assertions. Avoid mapping DOM nodes to text solely to compare an array.
- Import shared render helpers immediately after Testing Library imports. This is an explicit exception to the normal repository-helper import group.
- Use `renderWithProviders` for non-routing components or an existing `RouterProvider`. It never adds a router. Use `renderWithRouter` for components that require `MemoryRouter`; it always supplies one, with optional initial entries.
- Both render helpers supply the real Mantine theme and a fresh QueryClient per call, preserved across rerenders. Pass an explicit client only when a test needs to inspect or seed its cache.
- Use imported fixtures directly when tests only read them; do not introduce suite variables or `beforeEach` clones merely to wrap imports. Declare suite-level variables created by the test file inside the top-level `describe` and initialize them in `beforeEach`. Clone imported data with `structuredClone` only when a test needs to modify it; a copy used by one test can be created within that test. Never mutate shared imported fixtures. Servers and reusable render helpers may stay outside the suite; variables required by those outside helpers may remain outside as well.
- Name cache-isolation tests after the games exercised, such as switching from PoE to PoE2. Do not imply coverage of hypothetical games.

## Test structure and validation

Separate test hooks (`beforeEach`, `beforeAll`, `afterEach`, `afterAll`), `describe` blocks, and `it`/`test` blocks from neighboring statements with blank lines. Vitest tests use the recommended rules from `@vitest/eslint-plugin` plus the explicit hook, describe, and test padding rules.

Vitest tests must use `it` (including inside `describe`) with titles starting with `should ` followed by a description, for example `it('should return characters', ...)`. Describe titles name the subject and do not need that prefix.

Separate groups of `expect` statements from surrounding test setup and actions with a blank line. Consecutive assertions can stay together without blank lines between them.

Playwright files in `e2e/` use `eslint-plugin-playwright` recommended rules. Reuse only the whitespace rule `vitest/padding-around-expect-groups` there to separate synchronous and awaited assertion groups from setup/actions; Vitest naming and correctness rules remain scoped to unit tests.

Run `npm run test:coverage` before submitting changes. V8 coverage must reach 90% overall for each of statements, branches, functions, and lines across runtime source files in `src`. The `main.tsx` bootstrap entry point, tests, test setup, development mocks, generated declarations, and compile-only type checks are excluded. Do not exclude application code solely to meet the threshold.

Keep test hooks inside the top-level `describe` block in each unit test file, before its tests. Do not declare hooks at file scope.

Vitest uses `globals: true` in its own `vitest.config.ts`. Use the global test APIs in unit tests. React Testing Library automatically cleans up rendered components; do not add redundant cleanup hooks. Resource-specific teardown hooks still belong inside the relevant describe block.

Follow the behavior-focused guidance in [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library), using current Testing Library APIs.

- Always use `userEvent.setup()` and await user interactions. Do not use `fireEvent`; discuss unsupported interactions before introducing an exception. Playwright tests use Playwright's browser interactions.
- Prefer `screen` queries by role and accessible name, with `within` for scoped queries. Use labels or visible text where appropriate; avoid DOM traversal, CSS selectors, and test IDs when accessible queries work.
- Use `getBy*` for elements already present, `findBy*` for asynchronous appearance, and `queryBy*` when asserting absence.
- Use explicit assertions with descriptive jest-dom matchers, such as `toBeInTheDocument` and `toBeDisabled`.
- Rely on automatic cleanup and avoid unnecessary `act` wrappers. Investigate asynchronous warnings instead of hiding them.
- Keep actions outside `waitFor`. Its callback should contain one specific assertion, never an empty callback or a snapshot. Prefer `findBy*` when waiting for an element to appear.
- Use semantic HTML and appropriate accessible names. Do not add redundant or incorrect ARIA attributes just to make a test pass.

Component tests (`src/**/*.{test,spec}.{tsx,jsx}`) use the recommended React Testing Library and jest-dom ESLint rules, plus explicit user-event and assertion rules. Direct `fireEvent` imports are prohibited. Query choice, semantic HTML, use of `userEvent.setup()`, and unsupported interactions also require review; lint does not enforce every convention. In particular, the installed side-effect rule does not catch every call through a `userEvent.setup()` instance, so review `waitFor` callbacks for these interactions too. These rules do not apply to Playwright or non-component unit tests.

For component data-loading and button-triggered request tests, wrap MSW resolver callbacks in `vi.fn()` and assert request counts with `toHaveBeenCalledTimes`. Verify the initial load and additional requests caused by button actions (including retry); for independent character requests, verify retry leaves other characters unchanged. Exercise the real service and HTTP client rather than replacing them with service mocks for these checks. Avoid manual request counters.

Service tests use the shared MSW handlers and typed game mocks for successful responses. Cover failures and AbortSignal cancellation without turning either into an empty successful result.

Feature E2E layout checks use representative mobile (390px), tablet (900px), and desktop (1200px) widths in the default dark theme. Shared shell tests own light/dark switching and precise navigation-breakpoint checks, avoiding repetition in every feature.

Each application component file must have a corresponding unit test file. Keep component-specific behavior in those tests and retain cross-component routing/integration behavior in App tests instead of duplicating it. The `main.tsx` bootstrap exclusion remains; configuration, route definitions, and test utilities are not application components.

Use test-controlled promises for deterministic pending-request/loading and cancellation tests instead of fixed sleeps. Release a gate when request completion is part of the behavior under test. Avoid cleanup-only `try/finally` blocks and gate-release machinery: Vitest and MSW do not resolve arbitrary promises, but a pending promise alone does not keep the process alive. Retain teardown for real resources such as timers, subscriptions, or servers, and coordination needed to observe cancellation safely.

Rely on React Testing Library automatic unmount cleanup. Capture a render result only when the test needs it, such as rerendering or deliberately unmounting/remounting to test persisted state. Do not capture it or call `unmount` solely for cleanup.

Keep reusable render helpers at file scope when they do not depend on suite-local state; pass test-specific inputs as arguments. When render utilities are needed, destructure only those used, such as `const { rerender } = renderWithRouter(...)`.

When a suite repeatedly creates and clears its own QueryClient, declare it inside `describe`, create a fresh instance in `beforeEach`, and clear it in `afterEach`. This keeps tests isolated and ensures teardown runs after failed assertions. Do not add explicit clients to component tests that can use the shared render helpers’ default client.

Vitest defaults to jsdom for component tests. API-only test files explicitly select Node with `// @vitest-environment node`; do not add redundant jsdom annotations to component tests.

When asserting counts of service calls that accept arguments, also use `toHaveBeenNthCalledWith` to check the expected arguments for each newly made call, including retries. After an action, assert arguments only for new calls; do not repeat argument assertions for earlier calls already checked. Keep real-service/MSW integration: use named service imports with `vi.mock(module, { spy: true })` when call-through spies are needed, without replacing service implementations. MSW resolver arguments describe requests, not service-function arguments, so do not assert those as a substitute. Use explicit expected identifiers and appropriate matchers for framework-owned AbortSignals.

Vitest enables `clearMocks: true` and `restoreMocks: true` to isolate call histories and restore per-test spies automatically. Do not add redundant `vi.clearAllMocks()` or `vi.restoreAllMocks()` hooks. Module spy mocks retain their real implementations; keep teardown for resources such as MSW servers and QueryClients.

When splitting component files, move their focused behavior tests with them. Keep wrapper tests focused on routing and state-reset integration. Tests for game-specific behavior should use explicit PoE and PoE2 cases with direct named service assertions rather than conditional service selection inside a test.
