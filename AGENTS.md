# UI guidance

For package vulnerability reports, read and follow the [package vulnerability skill](.agents/skills/fix-dependabot-alert/SKILL.md) first. It applies to Dependabot alerts, npm audit findings, and statements such as "there is a vulnerability in axios" without requiring the user to name the skill or request a reinstall. During remediation, run only its specified commands and file reads in order. Defer Git inspection and development-workflow guidance until after its report; code-style and test guidance are unnecessary for dependency-only changes. Troubleshoot only an actual command failure.

For other changes, read the relevant guidance before making changes:

- [Code style](docs/code-style.md): source formatting, imports, Mantine styling, and display conventions.
- [Unit-test conventions](docs/unit-test-conventions.md): test structure, assertions, render helpers, and Playwright coverage.
- [Development workflow](docs/development-workflow.md): branches, reviews, validation, merges, and worktree cleanup.

Use feature branches and PRs; a code owner reviews changes before they are merged. Preserve uncommitted work and do not hand-edit generated files. Keep each convention in its focused document rather than duplicating it here.

See [README.md](README.md) for project setup and commands.
