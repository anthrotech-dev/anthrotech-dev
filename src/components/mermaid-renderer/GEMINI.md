# Mermaid Renderer Agent Guide

## Purpose
Common instructions for AI coding agents working on the Mermaid renderer module.

## Scope
- `./src/Mermaid.astro`
- `./src/MermaidLoader.astro`
- `./docs/reference.md`

## Required read order
1. `./docs/reference.md` (source of truth)
2. `./src/MermaidLoader.astro`
3. `./src/Mermaid.astro`

## Behavioral invariants (must keep)
- Mermaid script loading must remain singleton-like (no duplicate loads).
- Render pass must remain idempotent.
- Preview trigger binding must remain idempotent.
- Preview modal interactions must continue to work:
  - open / close
  - zoom in / zoom out
  - actual size / reset
  - pan / wheel zoom / touch pinch
- Existing public class names and DOM contracts should stay compatible.

## Idempotency flags (do not break)
- `data-mermaid-upgraded`
- `data-mermaid-rendered`
- `data-mermaid-preview-bound`

## Commit convention
Format:

`<prefix>(<scope>): <summary>`

Write commit messages in Japanese.

Allowed prefixes:
- `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `perf`, `build`, `ci`, `chore`, `revert`

Preferred scopes:
- `mermaid-renderer`
- `mermaid-loader`
- `mermaid-docs`

## Validation before commit
```bash
bunx prettier ./src/Mermaid.astro ./src/MermaidLoader.astro --plugin prettier-plugin-astro --check
npx astro build --silent
```

## Dependency rule
If dependencies are changed, keep lockfiles consistent for CI/Cloudflare (especially `pnpm-lock.yaml`).

## Change discipline
- Keep patches small and reviewable.
- Avoid unrelated refactors in the same commit.
- Update docs when behavior changes.
