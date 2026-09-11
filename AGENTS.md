# AGENTS.md — planet-crafter-save-tools

> **Pointer file. Do not add project context here: this repository is public.**

The project instructions for AI agents live in the private satellite repository `.do-not-commit`, checked out at
`.do-not-commit/planet-crafter-save-tools/AGENTS.md` (git-ignored here).

- Read `.do-not-commit/planet-crafter-save-tools/AGENTS.md` before working in this repository, and record every new
  project decision in the corpus it names — never in this file.
- `spec.awawa` at the root is a symbolic link into that private checkout: the project specification, as an awawa
  corpus. It is the home of the specification, the decisions and the open questions; `awawa status .` from here is
  where a session starts. Without access to the private repository the link dangles, which is expected — the public
  documentation in `docs/` stands on its own.
- `bun install` runs `scripts/sync-private-context.sh`: it clones the private repository when the account has access
  to it, then hands over to the `install.sh` that repository ships on its `main` branch, which checks out the branch
  named after this project. Contributors without access get a skip message and an otherwise normal install.
  Run it again at any time with `bun run private:sync`.
- If the private file is absent, you are working without the project context: say so instead of guessing, and rely on
  the general `~/.ai` instructions plus the public documentation in `docs/`.
