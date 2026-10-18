# AGENTS.md

Instructions for agents working in this meta-repository and its submodules
(`front-riles`, `back-riles`, `landing-riles`).

## Never leave a red CI

Every push must end with a green GitHub Actions run. Do not report a push as
done while a run is failing, pending, or unknown.

1. **Before pushing**, run the target repo's CI recipe locally. Use the exact
   commands from that repo's `.github/workflows/ci.yml` (or `npm run ci` when
   the script exists). Current recipes:
   - `riles` (meta): `npx --yes markdownlint-cli2`
   - `landing-riles`: `npm run ci` (lint + format:check + test)
   - `front-riles`: `npm run lint`, `npm run type-check`, `npm test`,
     `npm run test:rn`, `npm run format:check`
   - `back-riles`: read its `.github/workflows/ci.yml` and run the same steps.
2. **Push**, then watch the run. Find it and wait for the result:

   ```bash
   gh run list --repo loguio/<repo> --limit 1
   gh run watch <run-id> --repo loguio/<repo> --exit-status
   ```

3. **If the run fails**, fix the cause, push again, and watch the new run.
   Only stop when the latest run is green.
4. **Submodule moves**: push the submodule first, then advance and push the
   meta-repo pin. Confirm the meta-repo CI too (its `submodules` job checks the
   pins are resolvable).

## Local gotcha (Windows)

Prettier `format:check` reports false CRLF failures on a Windows checkout while
CI (Linux, LF) passes. Treat CI as the source of truth, but run
`npx prettier --write <changed files>` before pushing so the committed bytes are
LF-clean.
