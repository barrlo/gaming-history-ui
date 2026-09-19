# Contribution workflow

Both repositories use `main` as the default branch. Once Jacob finishes reviewing and authorizes the initial push, place the initial scaffold commits on `main`. Subsequent feature changes go through pull requests targeting `main`. Do not commit or push while the initial local review is still in progress.

Make each set of feature changes on a feature branch and open a GitHub pull request for Jacob to review before merging. Do not push feature changes directly to the default branch or merge without his approval. Include the behavior changed and relevant validation in each PR.

Keep UI and API changes in their respective repositories. When a feature spans both, link the companion PR and describe any deployment ordering.

## Code style

Leave a blank line between CSS rule blocks in `.css` and `.module.css` files, including sibling rules inside media queries.

Use component-scoped CSS Modules for UI styles, passed through Mantine `className` or `classNames`. Prefer appropriate Mantine layout components (`Box`, `Flex`, `Group`, `Stack`, `SimpleGrid`) and preserve semantic HTML with their `component` prop. Define shared colors and typography in `src/theme.ts` using Mantine `createTheme` and `cssVariablesResolver`; consume the generated variables in CSS Modules. Keep global CSS limited to document/body defaults.

Always leave a blank line after the group of imports at the top of a file. ESLint enforces this for maintained JavaScript and TypeScript files; generated files remain owned by their generators.

Use curly braces for all control-flow bodies, including single-line `if`, `else`, and loops. Leave a blank line after a completed block (such as `if`, `switch`, or a function definition) when another statement follows. Keep related `else`, `catch`, and `finally` clauses attached to their block. Prefer arrow functions over the `function` keyword in JavaScript and TypeScript, except when function-specific behavior (such as a dynamic `this` or a generator) is required.

Variable and parameter names must contain at least three characters. Only unused function arguments may use `_` to mark a skipped argument; do not use `_` for ordinary variables or read a skipped argument. Object property names imposed by APIs are not variable bindings (alias short properties when destructuring).

Write literal JSX child text as a quoted string expression, for example `<Text>{'Example'}</Text>`, rather than bare JSX text. JSX attributes may retain their normal quoted syntax, and dynamic values remain expressions.

Separate test hooks (`beforeEach`, `beforeAll`, `afterEach`, `afterAll`), `describe` blocks, and `it`/`test` blocks from neighboring statements with blank lines. Vitest tests use the recommended rules from `@vitest/eslint-plugin` plus the explicit hook, describe, and test padding rules.

Vitest tests must use `it` (including inside `describe`) with titles starting with `should ` followed by a description, for example `it('should return characters', ...)`. Describe titles name the subject and do not need that prefix.

Separate groups of `expect` statements from surrounding test setup and actions with a blank line. Consecutive assertions can stay together without blank lines between them.

## Import order

Use the following groups in order, omitting groups that are not needed. Do not insert blank lines between groups; retain a blank line after the final import.

1. React itself (`react`).
2. React platform and routing packages (`react-dom`, `react-router`, `react-router-dom`).
3. External functionality packages (for example TanStack Query, Axios, Zustand, react-hook-form, and test utilities).
4. Component libraries (for example Mantine), including their required stylesheets.
5. Component-library companion packages (for example Tabler icons).
6. React component files from this repository (for example `./App`).
7. Other repository modules: helpers, state, API clients, types, and fixtures.
8. Repository stylesheets and other local style modules.

Type-only imports stay with their source group. Preserve the relative order of side-effect imports, especially stylesheets, where order affects behavior. Library styles precede local style overrides. This grouping convention is documented for review; automatic import-order lint enforcement has not yet been configured.

Playwright files in `e2e/` use `eslint-plugin-playwright` recommended rules. Reuse only the whitespace rule `vitest/padding-around-expect-groups` there to separate synchronous and awaited assertion groups from setup/actions; Vitest naming and correctness rules remain scoped to unit tests.

Run `npm run test:coverage` before submitting changes. V8 coverage must reach 90% overall for each of statements, branches, functions, and lines across runtime source files in `src`. The `main.tsx` bootstrap entry point, tests, test setup, development mocks, generated declarations, and compile-only type checks are excluded. Do not exclude application code solely to meet the threshold.

Keep test hooks inside the top-level `describe` block in each unit test file, before its tests. Do not declare hooks at file scope.

Vitest uses `globals: true` in its own `vitest.config.ts`. Use the global test APIs in unit tests. React Testing Library automatically cleans up rendered components; do not add redundant cleanup hooks. Resource-specific teardown hooks still belong inside the relevant describe block.

Alphabetize configuration object properties (except in the ESLint configuration and `package.json`), React JSX props, and object properties by name, case-insensitively. Keep spreads and computed or order-sensitive properties in their semantic positions; sort within safe sections only. Preserve array order. Do not manually sort generated artifacts or pinned contract fixtures.

Leave a blank line before a `return` statement when another statement precedes it in the same block. A return that is the first statement in a block does not need padding against the opening brace. UI ESLint enforces this convention; API Rider/ReSharper formatting supports it through the control-transfer spacing setting (which also applies to other control-transfer statements). The API CLI formatter does not enforce this specific rule.

## React Testing Library conventions

Follow the behavior-focused guidance in [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library), using current Testing Library APIs.

- Always use `userEvent.setup()` and await user interactions. Do not use `fireEvent`; discuss unsupported interactions before introducing an exception. Playwright tests use Playwright's browser interactions.
- Prefer `screen` queries by role and accessible name, with `within` for scoped queries. Use labels or visible text where appropriate; avoid DOM traversal, CSS selectors, and test IDs when accessible queries work.
- Use `getBy*` for elements already present, `findBy*` for asynchronous appearance, and `queryBy*` when asserting absence.
- Use explicit assertions with descriptive jest-dom matchers, such as `toBeInTheDocument` and `toBeDisabled`.
- Rely on automatic cleanup and avoid unnecessary `act` wrappers. Investigate asynchronous warnings instead of hiding them.
- Keep actions outside `waitFor`. Its callback should contain one specific assertion, never an empty callback or a snapshot. Prefer `findBy*` when waiting for an element to appear.
- Use semantic HTML and appropriate accessible names. Do not add redundant or incorrect ARIA attributes just to make a test pass.

Component tests (`src/**/*.{test,spec}.{tsx,jsx}`) use the recommended React Testing Library and jest-dom ESLint rules, plus explicit user-event and assertion rules. Direct `fireEvent` imports are prohibited. Query choice, semantic HTML, use of `userEvent.setup()`, and unsupported interactions also require review; lint does not enforce every convention. In particular, the installed side-effect rule does not catch every call through a `userEvent.setup()` instance, so review `waitFor` callbacks for these interactions too. These rules do not apply to Playwright or non-component unit tests.
