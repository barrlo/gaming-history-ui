# Code style

Leave a blank line between CSS rule blocks in `.css` and `.module.css` files, including sibling rules inside media queries.

Use component-scoped CSS Modules for UI styles, passed through Mantine `className` or `classNames`. Prefer appropriate Mantine layout components (`Box`, `Flex`, `Group`, `Stack`, `SimpleGrid`) and preserve semantic HTML with their `component` prop. Define shared colors and typography in `src/theme.ts` using Mantine `createTheme` and `cssVariablesResolver`; consume the generated variables in CSS Modules. Keep global CSS limited to document/body defaults.

Always leave a blank line after the group of imports at the top of a file. ESLint enforces this for maintained JavaScript and TypeScript files; generated files remain owned by their generators.

Use curly braces for all control-flow bodies, including single-line `if`, `else`, and loops. Leave a blank line after a completed block (such as `if`, `switch`, or a function definition) when another statement follows. Keep related `else`, `catch`, and `finally` clauses attached to their block. Prefer arrow functions over the `function` keyword in JavaScript and TypeScript, except when function-specific behavior (such as a dynamic `this` or a generator) is required.

Variable and parameter names must contain at least three characters. Only unused function arguments may use `_` to mark a skipped argument; do not use `_` for ordinary variables or read a skipped argument. Object property names imposed by APIs are not variable bindings (alias short properties when destructuring).

Write literal JSX child text as a quoted string expression, for example `<Text>{'Example'}</Text>`, rather than bare JSX text. JSX attributes may retain their normal quoted syntax, and dynamic values remain expressions.

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

Alphabetize configuration object properties (except in the ESLint configuration and `package.json`), React JSX props, and object properties by name, case-insensitively. Keep spreads and computed or order-sensitive properties in their semantic positions; sort within safe sections only. Preserve array order. Do not manually sort generated artifacts or pinned contract fixtures.

Leave a blank line before a `return` statement when another statement precedes it in the same block. A return that is the first statement in a block does not need padding against the opening brace. UI ESLint enforces this convention; API Rider/ReSharper formatting supports it through the control-transfer spacing setting (which also applies to other control-transfer statements). The API CLI formatter does not enforce this specific rule.

Use Mantine font-size, spacing, and radius variables when their values match the design. Define recurring custom values in the shared theme and CSS variables resolver so roster styles can reuse them. Preserve approved dimensions rather than rounding to the nearest built-in token. Use `rem` or theme tokens for component typography, spacing, sizing, and radii. Thin borders may stay in pixels and media breakpoints in `em`. Preserve the browser's root font-size preference; do not force a 16px root.

Display collection timestamps and league dates in the browser's timezone. Generate timezone labels with Intl so daylight-saving offsets remain accurate. This display preference does not change Central-time job schedules or historical snapshot boundaries. Test timezone conversion deterministically, including daylight-saving changes.

Use Prettier with `printWidth: 120`. For test-specific import ordering, follow [unit-test conventions](unit-test-conventions.md).

Combine consecutive uninitialized `let` declarations in the same scope into one declaration statement, for example `let client: QueryClient, current: CurrentScore;`. Prettier may wrap the declarators across multiple lines; keep them in one statement. This convention is reviewed manually.
