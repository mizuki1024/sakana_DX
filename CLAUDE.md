# Claude Code Project Instructions

This project uses a structured, token-efficient development workflow.

The goal is to use Claude Code effectively without wasting tokens:
- Plan deeply only when needed.
- Implement narrowly.
- Review only the relevant diff.
- Avoid unnecessary repository scans.
- Avoid unrelated refactors.

## Default workflow

For any non-trivial development task, follow this workflow:

1. Use `planner-agent`.
2. Use `implementation-agent`.
3. Use `review-agent`.
4. If review-agent finds blocking issues, use `implementation-agent` to fix only those issues.
5. Run relevant checks again.
6. Use `review-agent` again if meaningful.
7. Provide a concise final report.

For very small tasks, such as typo fixes, copy changes, or obvious one-line edits, a full planner-agent step may be skipped. Still keep the diff minimal and run relevant checks if appropriate.

## Agent roles

### planner-agent

Use for:
- requirement analysis
- codebase investigation
- implementation planning
- task breakdown
- risk analysis
- test planning
- architectural judgment

Rules:
- Must not edit files.
- Must inspect only relevant files.
- Must keep the plan concise.
- Must identify scope limits.
- Must identify the smallest safe implementation path.

### implementation-agent

Use for:
- implementing approved plans
- making scoped code changes
- adding or updating tests
- running relevant checks
- fixing blocking issues found by review-agent

Rules:
- Must keep changes minimal.
- Must not expand scope.
- Must not perform unrelated refactors.
- Must not touch unrelated files.
- Must follow existing project conventions.
- Must run the narrowest useful checks first.
- Must report changed files and check results.

### review-agent

Use for:
- reviewing current diffs
- finding bugs
- checking architecture consistency
- checking test coverage
- identifying security, reliability, and data risks

Rules:
- Must not edit files.
- Must review git diff first.
- Must focus on blocking issues.
- Must not review unrelated existing code.
- Must keep feedback concise and actionable.

## Token efficiency rules

Always prefer token-efficient behavior.

### Do

- Use targeted search before reading files.
- Read only relevant files.
- Keep outputs concise.
- Prefer small scoped tasks.
- Prefer exact file and directory scopes.
- Review diffs instead of the whole repository.
- Run focused tests before broad test suites.
- Reuse previous findings instead of rediscovering them.
- Stop and report if the task becomes broader than expected.

### Do not

- Do not scan the entire repository by default.
- Do not summarize unrelated files.
- Do not paste long logs unless necessary.
- Do not produce multiple long implementation options unless requested.
- Do not perform broad refactors unless explicitly requested.
- Do not fix unrelated failures.
- Do not repeatedly restate the same plan.
- Do not read generated files, build outputs, dependency directories, or lockfiles unless necessary.

## Scope control

Before implementation, clarify or infer:

- What should be changed.
- What should not be changed.
- Which directories are in scope.
- Whether database schema changes are allowed.
- Whether API changes are allowed.
- Which tests should be run.

When the user does not specify scope, infer the smallest reasonable scope from the request and existing codebase.

## Safety rules

Never modify the following unless explicitly requested:

- secrets
- credentials
- `.env` files
- production config
- deployment config
- database migrations
- lockfiles
- generated files
- third-party vendored code
- unrelated formatting across many files

If a requested change appears risky, stop and explain the risk before proceeding.

## Testing rules

After implementation, run the narrowest relevant checks first.

Preferred order:

1. Tests directly related to changed files.
2. Type check for affected package or workspace.
3. Lint for affected files.
4. Broader test suite only if necessary or requested.
5. Build only if relevant and reasonably scoped.

If checks cannot be run, explain why.

If checks fail, classify failures as:

- caused by this change
- pre-existing
- unclear

Fix only failures caused by this change unless the user asks otherwise.

## Git and diff rules

Use git diff to understand current changes before review.

Before final response, check:

- changed files
- relevant test results
- remaining risks

Do not commit unless the user explicitly asks.

Do not create branches unless the user explicitly asks.

Do not push unless the user explicitly asks.

## Default user command interpretation

When the user says:

> Implement this

Interpret it as:

1. Plan with planner-agent.
2. Implement with implementation-agent.
3. Review with review-agent.
4. Fix blocking issues if any.
5. Report final result.

When the user says:

> Do this quickly

Interpret it as:

- Use the smallest safe workflow.
- Skip long explanations.
- Do not skip necessary checks.
- Keep the final report concise.

When the user says:

> Be careful

Interpret it as:

- Use the full workflow.
- Avoid broad changes.
- Review risks explicitly.
- Run meaningful checks.

When the user says:

> Save tokens

Interpret it as:

- Avoid broad scans.
- Use targeted search.
- Keep outputs short.
- Use diff-based review.
- Run focused checks.
