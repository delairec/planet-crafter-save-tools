<!-- awawa-usage-report -->

# 2026-09-17 — Defects of the corpus starter, found walking Flow S

**The tool's**: four defects of `awawa-specification-starter.md`, all four in the closing formula repeated by the
eight steps of Flow S, and all four observed on the same step boundary — S1 to S2 of the product specification area
of planet-crafter-save-tools.

| Field | Value |
|-------|-------|
| **Document under review** | `docs/awawa-usage-reports/artifact-assets/awawa-specification-starter.md`, as served to the awawa team |
| **Walk** | Flow S, product specification area, planet-crafter-save-tools |
| **Steps observed** | S1 (inventory) and S2 (types), 2026-09-17 |
| **Author of this report** | `Claude Opus 5 (1M context)`, effort `unchecked` |

## Defects

| # | Defect | Evidence | Remediation proposed |
|---|--------|----------|----------------------|
| 1 | A step's result is written nowhere, so the next session cannot read it | S1 ends on « Respond with the inventory table (place, kinds of fact, example) and the five questions », naming no file. Measured: the S2 session could re-read neither the inventory nor the five questions; `grep -rln S1 docs/` returns nothing, `git status` is clean, no work file exists. S2 re-derived the inventory from the repository and stated it had done so | Every step writes its result to a named work file, and the next step's prompt carries that file's path among its entry answers |
| 2 | Questions meant for the user are printed, never asked | S1 says « List the five questions a working session most often asks about the object »; the step lists them and nothing requires that they be put to the user, while the starter's entry point does say « Ask the user » for Question 1. Measured: the five questions of S1 were never presented, so none was arbitrated | A step that produces a question puts it to the user and waits for the answer; what is only printed is not arbitrated |
| 3 | The next step's prompt is proposed together with the result, before any arbitration | All eight steps of Flow S end on « then propose the S<n+1> prompt ». Measured: the S3 prompt was proposed at the end of S2, then the user's refinement changed four of the five open points and added a type, so the prompt was stale when it was written | The next prompt is emitted only once the step's work is done and arbitrated, after the user's last answer |
| 4 | Nothing says when a step is over: no step asks the user to confirm that every point is settled | The eight steps end on « Respond with … then propose the S<n+1> prompt », which makes the answer the end of the step. Measured: S2 was answered three times — the first answer carried five open points, the second changed four of them and added the `DATATABLE` type, the third corrected the table inventory — with no confirmation asked at any of the three | A step ends only when every point it opened is settled and the user, asked the question, confirms moving to the next step; the answer alone never ends it |

## Scope of the claim

The four defects are read from the starter's text and observed on one step boundary of one walk. Nothing here is
measured over the eight steps: S3 onwards had not run when this report was written.
