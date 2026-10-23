# Development workflow

Both repositories use `main` as the default branch. Feature changes go through pull requests targeting `main`.

Make each set of feature changes on a feature branch and open a GitHub pull request for Jacob to review before merging. Do not push feature changes directly to the default branch or merge without his approval. Include the behavior changed and relevant validation in each PR.

Keep UI and API changes in their respective repositories. When a feature spans both, link the companion PR and describe any deployment ordering.

Jacob’s approval authorizes merging after verifying that it covers the current changes and required checks pass. Always squash merge; do not bypass failing checks or branch protections. After merging, switch the primary checkout to `main` and run `git pull --ff-only`, preserving uncommitted work.

After merging and updating the primary checkout, close Rider or WebStorm windows opened for completed worktrees, preserving unsaved work and unrelated windows. Check for uncommitted changes, remove completed worktrees with `git worktree remove`, and remove empty parent directories. Never force removal of unfinished work.

Routine dependency synchronization, such as merging a parent feature branch into its stacked child or updating a feature branch from `main`, does not need a separate PR. Intentional feature integration still requires review. Final feature PRs target `main` and use squash merging.

Do not start a preview server just because work is finished or a PR is opened. Jacob will request one or start it himself. Stop temporary servers used for automated verification when checks finish.

Keep setup instructions and available check commands in [README.md](../README.md). Run checks appropriate to the changes and report their results in the PR. Documentation-only changes require formatting and link checks rather than rerunning application tests.

The current Exile character-detail milestone is read-only: latest stored builds, paginated snapshot dates, and immutable historical selections. Manual Update/refresh operations and cooldown controls belong to a later PR; opening a build page does not request an upstream refresh. Development roster and build mocks mirror the API's runtime examples; canonical contract fixtures remain unchanged.

After a convention-changing PR merges, synchronize other open PR branches from `main`, apply the relevant conventions to their changes, run appropriate checks, and push updates. Updated PRs require renewed code-owner approval before merging.
