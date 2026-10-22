# Unit-test conventions

- Keep exactly one top-level `describe` per test file. Nested suites can group scenarios. The ESLint Vitest and Playwright rules enforce the single top-level suite for their respective files.
- Prefer `toStrictEqual` for object and array comparisons. Both test plugins enforce this preference.
- Assert rendered content with Testing Library queries and DOM matchers. For ordered collections, get the elements, assert their length, then use indexed `toHaveTextContent` assertions. Avoid mapping DOM nodes to text solely to compare an array.
- Import shared render helpers immediately after Testing Library imports. This is an explicit exception to the normal repository-helper import group.
- Use `renderWithProviders` for non-routing components or an existing `RouterProvider`. It never adds a router. Use `renderWithRouter` for components that require `MemoryRouter`; it always supplies one, with optional initial entries.
- Both render helpers supply the real Mantine theme and a fresh QueryClient per call, preserved across rerenders. Pass an explicit client only when a test needs to inspect or seed its cache.
- Keep `structuredClone` when modifying nested fixture data so tests cannot mutate a shared fixture.
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

Service tests use the shared MSW handlers and typed game mocks for successful responses. Cover failures and AbortSignal cancellation without turning either into an empty successful result.

Feature E2E layout checks use representative mobile (390px), tablet (900px), and desktop (1200px) widths in the default dark theme. Shared shell tests own light/dark switching and precise navigation-breakpoint checks, avoiding repetition in every feature.
