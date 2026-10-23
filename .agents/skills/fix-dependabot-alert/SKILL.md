---
name: fix-dependabot-alert
description: Use when the user reports a Dependabot alert or a vulnerability in an npm package in this repository, even without explicitly asking for a fix or reinstall. Trace the package locally, remove its direct parents, and reinstall them within their original installed major versions.
---

# Fix a Dependabot alert

Use this workflow in the UI repository when the user reports a Dependabot alert or a package vulnerability.
Statements such as "there is a Dependabot alert for axios" and "there is a vulnerability in axios" trigger it;
the user does not need to name this skill, say "fix", or request a dependency reinstall.
Read this skill and start with the local dependency inspection below before researching advisories on the web
or choosing another remediation approach. An advisory URL or vulnerability identifier is not required to start.
Honor an explicit request for explanation or research only without changing dependencies.
Accept the affected package name from the request, including scoped names such as `@scope/package`.
If no package name is supplied or the target is ambiguous, ask for it before changing dependencies.
Treat the package name as a literal npm package name, not shell code or an arbitrary npm option.

## Inspect and record

1. Read the repository guidance and work from the directory containing its `package.json` and `package-lock.json`.
   Preserve unrelated changes and follow the repository's feature-branch and review workflow.
2. Run `npm ls "<package>" --all` to find every installed occurrence and its paths from the project root.
   Inspect the tree and diagnostics, not just the exit code: npm can return a nonzero status for an empty result
   or an invalid dependency tree. The project header and `(empty)` do not count as package matches.
   Do not interpret command failures, unreadable output, or dependency errors as a clean result.
3. For each matching path, identify the direct dependency declared in this project's manifest at the top of the path.
   Include all such direct dependencies, including development dependencies and deduplicated paths.
   If the affected package itself is a direct dependency, include it too.
4. Before any uninstall, record each affected direct package's name, original manifest specification,
   dependency section, exact installed version, and installed major version. Resolve versions from the installed
   tree or lockfile rather than guessing from a range. Keep this restoration inventory across all iterations;
   record each package only once. If a version cannot be determined or a package uses an alias, workspace,
   Git, or file specification that cannot safely be restored as `name@major`, stop and explain the blocker
   before removing it.

If the initial inspection has no matches, report that the package is not present and no reinstall was needed.
Do not claim that this proves the Dependabot alert is resolved.

## Remove until absent

1. Run `npm uninstall <direct-package> ...` for the direct dependencies identified in the current tree.
   Use npm to update the manifest and lockfile; do not hand-edit the lockfile or delete it to force resolution.
2. Repeat `npm ls "<package>" --all` after each uninstall batch.
3. If matches remain, identify and record any remaining direct parents, uninstall them, and inspect again.
   Continue until no occurrence of the affected package remains.
4. Require progress on every iteration: remove at least one previously unremoved, declared direct dependency.
   If matches remain without a removable direct parent, or an uninstall fails, stop the removal loop and report
   the tree and blocker. Do not loop indefinitely, remove unrelated dependencies, or start a normal reinstall
   while the package is still present.

If removal is interrupted or blocked, use the inventory to restore only this workflow's removals with their
original specifications, preserving pre-existing edits. Report any incomplete restoration explicitly.
Do not leave missing dependencies silently or describe a blocked attempt as a successful fix.

## Reinstall and verify

1. Once the affected package is absent, reinstall every package in the inventory at its original installed major.
   For example, an installed `axios` version of `1.20.0` becomes `npm install axios@1`.
   A scoped dependency becomes `npm install @scope/package@<major>`.
   Restore packages to their original dependency sections: use `--save-dev` for `devDependencies`,
   `--save-optional` for `optionalDependencies`, and the appropriate save option for other recorded sections.
   Preserve the repository's version-saving convention, using `--save-exact` where dependencies are pinned.
   Batch packages in the same section when appropriate to resolve related dependencies together.
   Do not change major versions, add overrides, use `--force` or `--legacy-peer-deps`, or run `npm audit fix`
   as an automatic fallback.
2. Confirm every removed direct dependency has been restored in the correct section and still uses the recorded
   major version. If installation fails, report the failure and restore this workflow's removals using the saved
   original specifications where possible; explicitly identify anything still unrestored.
3. Run `npm ls "<package>" --all` again after all reinstalls complete. For this workflow, **clean means no matches
   for the named package**, not merely a zero exit status or a different installed version.
   A patched version still appearing in the tree does not satisfy this absence-based check.
4. If any occurrence remains, state: **"The issue was not fixed by reinstalling current versions."**
   Include the remaining versions and direct dependency paths. Do not repeat the entire reinstall cycle
   automatically or claim that the alert is resolved.
5. If no occurrences remain and inspection has no unresolved errors, report that the requested package is absent.
   Distinguish this local result from confirmation that GitHub has closed the Dependabot alert.
6. Review the manifest and lockfile diff for unintended removals, section changes, or major-version changes.
   Run the repository checks appropriate to the changed dependencies before submitting the result for review.
   Summarize removed/reinstalled packages, their before/after versions, final inspection, and validation results.
