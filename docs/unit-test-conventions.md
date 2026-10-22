# Unit-test conventions

- Keep exactly one top-level `describe` per test file. Nested suites can group scenarios. The ESLint Vitest and Playwright rules enforce the single top-level suite for their respective files.
- Prefer `toStrictEqual` for object and array comparisons. Both test plugins enforce this preference.
- Assert rendered content with Testing Library queries and DOM matchers. For ordered collections, get the elements, assert their length, then use indexed `toHaveTextContent` assertions. Avoid mapping DOM nodes to text solely to compare an array.
- Import shared render helpers immediately after Testing Library imports. This is an explicit exception to the normal repository-helper import group.
- Use `renderWithProviders` for non-routing components or an existing `RouterProvider`. It never adds a router. Use `renderWithRouter` for components that require `MemoryRouter`; it always supplies one, with optional initial entries.
- Both render helpers supply the real Mantine theme and a fresh QueryClient per call, preserved across rerenders. Pass an explicit client only when a test needs to inspect or seed its cache.
- Keep `structuredClone` when modifying nested fixture data so tests cannot mutate a shared fixture.
- Name cache-isolation tests after the games exercised, such as switching from PoE to PoE2. Do not imply coverage of hypothetical games.

Existing conventions in CONTRIBUTING.md still apply, including `it('should ...')`, hooks inside the suite, assertion spacing, and awaited user-event interactions.
