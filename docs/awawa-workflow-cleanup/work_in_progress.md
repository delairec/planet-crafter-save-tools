# Corpus cleanup — work in progress

Running state of the migration argued in `findings.md`. Updated at each step; deleted with
`findings.md` once the migration is done. Rulings live in the corpus, not here — this file only
tracks what is done, what is next, and what is still open.

## Done

| step | commit | recorded as |
|---|---|---|
| four absorbed superseded decisions removed | `595421e` | `@DECISION.UneDecisionSupersedeeEstRetireeQuandSaSuccesseureLaContientToute` |
| `OPEN_QUESTION` ladder `open\|closed`, 61 entities retyped (21/40) | `485b030` | `@DECISION.UneQuestionOuverteDeclareSonEchelleDeStatut` |
| schema prose turned English, data prose stays French | `485b030` | `@DECISION.LeSchemaEstRedigeEnAnglaisEtLesDonneesEnFrancais` |

Per-type shadowing of the wildcard enum is proven on real data, not a throwaway copy — the
mechanism every new ladder in `findings.md` §3 rests on.

## Next

1. Name the types against real entities — `CORPUS_RULE` / `PRACTICE` / `CONVENTION` are three words
   a reader must tell apart at a glance (`findings.md` §7.1).
2. Find out whether retyping 137 entities has tool support: `fmt --rename` renames an entity, not
   its type. Otherwise a scripted text pass validated by `lint --strict` and `diff` (§7.3).
3. Then one type at a time, smallest first, each with its own `SCHEMA`, ladder and `GATE` per value.

## Open

- `@DECISION.UneDecisionRetireeNommeSaSuccesseure` was rewritten in place though it comes from the
  base, not from this PR: its second `RATIONALE` argued the wildcard line stood so no closed
  question would be asked for a `SUPERSEDED_BY` it will never have, which the per-type block now
  does better. A `:v2` with `SUPERSEDES` instead is a `fmt --rename` plus three fields moved.
- `FACT` drops the `REQUIRED` on `REJECTED`; six entities currently pay a fictional one (§3).
- The four decisions that only say a rule left for `~/.ai` — `EXTERNAL_RULE` or removal, examined
  one by one, never in bulk (§5).
- The three accepted limitations that are `awawa`'s, not the project's: what is kept is the
  workaround, which argues for `SUBJECT` on `LIMITATION` (§5).

## Not rewritten, by rule

- `questions.awawa:356` — a `RATIONALE` reporting a 2026-09-12 measurement that names a question
  `superseded`. A dated record says what was true at its date.
- The ten dated usage reports and merged PR bodies keep citing entities as they were.
- `~/.claude/skills/awawa/SKILL.md` cites `--where STATUS!=superseded` as a generic tool example,
  valid for any corpus — out of this project's scope.
