---
name: fix-dependabot-alert
description: Use when the user reports a Dependabot alert, npm audit finding, or vulnerability in an npm package in this repository, even without explicitly asking for a fix or reinstall. Remove the responsible direct dependencies and reinstall them within their original major versions.
---

# Fix a package vulnerability

Follow the steps below in order. A report such as "there is a Dependabot alert for axios" or
"there is a vulnerability in axios" triggers this workflow. Honor explicit requests for research or explanation
only without changing dependencies.

## Constraints

- Run only the commands and file reads specified by the current step, in order. Do not add flags, preliminary
  checks, extra document reads, research, or parsing scripts, even to "double-check" something. In particular,
  do not run `git status`, `command -v npm`, `npm view`, or an initial audit, or read development-workflow,
  code-style, or test guidance during remediation. Read npm output directly.
- Troubleshoot only after an actual command failure, using only the additional commands or reads needed to
  resolve that failure. An empty `npm ls` result or audit findings alone do not trigger troubleshooting.
  Do not use recovery as a reason to investigate unrelated issues or repeat successful checks.
- Preserve unrelated work, dependency sections, and original majors. Do not add overrides/resolutions, use
  `--force` or `--legacy-peer-deps`, run `npm audit fix`, or delete or hand-edit the lockfile.
- Stop if removal makes no progress or a command fails. Restore this workflow's removals from the snapshot
  where possible and report anything unrestored. Do not automatically repeat the entire reinstall cycle.
- Lint, typecheck, tests, and build are outside this skill; leave them to the remediation PR's CI.

## Steps

1. **Identify the package.** Use the name from the request, including scoped names. If missing or ambiguous,
   ask for it before continuing. Treat it as a literal package name in commands.
2. **Snapshot dependencies.** In the UI repository, read `package.json` and retain all direct dependency names,
   original ranges, majors, and sections before uninstalling anything. Read and retain `package-lock.json` for reporting
   resolved versions afterward. This covers packages discovered later in the removal loop. A range such as
   `^1.20.0` identifies major 1; stop before removing a dependency whose specification cannot safely be restored
   with `name@major`.
3. **Trace parents.** Run `npm ls "<package>" --all`. Identify every declared direct dependency at the root of
   a matching path, including development dependencies and deduplicated paths. Include the target itself if
   directly declared. If no matches exist initially, skip removal and reinstall and proceed to verification.
4. **Remove and repeat.** Run `npm uninstall <direct-package> ...` for those direct dependencies and record
   every removal. Repeat `npm ls "<package>" --all` after each batch. If matches remain, uninstall the newly
   implicated direct parents using the original snapshot. Continue until the target is absent. Each iteration
   must remove at least one previously unremoved direct dependency; otherwise stop and report the blocker.
   The project header and `(empty)` are not matches. Inspect diagnostics as well as exit status: an empty
   result can have a nonzero exit status, and dependency errors do not establish absence.
5. **Reinstall at original majors.** Reinstall every removed package in its original section, saving caret ranges.
   For example, `axios` at `^1.20.0` becomes `npm install axios@1`;
   development packages use `npm install --save-dev <name>@<major> ...`. Use `--save-optional`
   for optional dependencies. Batch packages by section where appropriate. No package may jump majors.
6. **Verify once.** After reinstalling everything, run `npm ls "<package>" --all`, then `npm audit` once.
   The target may remain installed at a patched version. Use the audit to determine whether the exact named
   package is still vulnerable, and check the tree against any vulnerable versions supplied in the request.
   Do not independently research advisory ranges or claim to have checked them. Ignore unrelated audit
   findings, including a nonzero audit exit status caused solely by those findings. Command or audit-service
   errors mean verification is blocked, not successful. Repeat verification only if a command fails or the
   dependencies change.
7. **Report.** Read `package.json` again to confirm all removed packages are restored in their original sections
   and majors with caret ranges. Read the original and updated lockfiles only to report the removed packages'
   before/after resolved versions; do not treat manifest ranges as installed versions. Summarize those versions,
   the saved ranges, and the target's final tree and audit results.
   If a known vulnerable version remains or audit still flags the target, say:
   **"The issue was not fixed by reinstalling current versions."** Otherwise report that audit no longer flags
   the specified package, without claiming GitHub has closed its alert or that the entire audit is clean.
   Mention unrelated findings only as outside scope.

After the remediation report, read the development-workflow guidance and perform Git inspection and branch/PR
preparation for the resulting fix, preserving existing work. Keep this housekeeping outside the steps above;
do not commit or push remediation changes directly to `main`.
