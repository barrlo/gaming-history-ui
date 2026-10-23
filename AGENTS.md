# UI guidance

Read the relevant guidance before making changes:

- [Code style](docs/code-style.md): source formatting, imports, Mantine styling, and display conventions.
- [Unit-test conventions](docs/unit-test-conventions.md): test structure, assertions, render helpers, and Playwright coverage.
- [Development workflow](docs/development-workflow.md): branches, reviews, validation, merges, and worktree cleanup.
- [Package vulnerability skill](.agents/skills/fix-dependabot-alert/SKILL.md): when the user reports a Dependabot alert or a vulnerability in an npm package, read and use this skill first, before researching advisories on the web or choosing a remediation approach. This includes statements such as "there is a Dependabot alert for axios" or "there is a vulnerability in axios"; the user does not need to name the skill or request a reinstall.

Use feature branches and PRs; a code owner reviews changes before they are merged. Preserve uncommitted work and do not hand-edit generated files. Keep each convention in its focused document rather than duplicating it here.

See [README.md](README.md) for project setup and commands.
