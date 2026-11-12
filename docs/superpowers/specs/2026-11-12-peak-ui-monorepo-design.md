# Move Peak UI into the PMM monorepo

- **Ticket:** [PMM-15905](https://perconadev.atlassian.net/browse/PMM-15905) — Internalize peak-ui into monorepo
- **Status:** Approved 2026-11-12. Plan: `docs/superpowers/plans/2026-11-12-peak-ui-monorepo.md`
- **Repos:** `percona/peak-ui` (source, to be archived) → `percona/pmm` (`ui/packages/peak-ui/`)

## Goal

Peak UI is developed inside the PMM monorepo, and every PMM release publishes a matching `@percona/peak-ui` to npm.

Success means:

- A component change and the PMM code using it land in one PR.
- PMM's packages always run the Peak UI in the same commit (no more mixed npm pins).
- Nobody publishes from a laptop; a PMM release tag publishes `@percona/peak-ui@<PMM version>` with provenance.
- Peak UI's git history, public Storybook links and published `llms.txt` links keep working.

## Starting point (2026-11-12)

| | `percona/peak-ui` | PMM `ui/` workspace |
|---|---|---|
| Version / release | 1.0.32; manual `pnpm publish` with 2FA | Every package `private`; nothing published |
| Package manager | pnpm 9/10, own lockfile | pnpm 11 + turbo, `ui/pnpm-lock.yaml` |
| Lint / format | ESLint + Prettier (100 cols) | oxlint + oxfmt (80 cols), root `format:check` covers the whole tree |
| TypeScript / React | TS 5.9, React 18 dev deps, peer `react ^18.3.1` | TS ~6.0.3, React 19 (`apps/pmm`, `extensions/framework`, `plugins/atw`) |
| CI | own `ci.yml`, Chromatic, Storybook and PR previews → GitHub Pages | `ui.yml` runs `make ci` on any `ui/` change |
| Peak UI usage | — | `apps/pmm` 1.0.31; `extensions/framework`, `plugins/atw` 1.0.26 |

PMM release tags are annotated `v3.x.y` tags made by Jenkins on `pmm-3.x.y` branches; there are no RC tags. Internal packages are consumed as source (`"main": "./src/index.ts"`). SEP was vendored earlier as one squashed commit (PMM-15205).

## Decisions

| Topic | Decision | Rejected alternatives |
|---|---|---|
| Version | Published version = PMM version (`v3.12.0` → `@percona/peak-ui@3.12.0`) | Own hand-bumped semver; changesets |
| History | Keep all commits, rewritten under `ui/packages/peak-ui/`, merged with a merge commit | One squashed import like SEP |
| Tooling | oxlint + oxfmt at PMM's settings (80 cols); rewrap commit listed in `.git-blame-ignore-revs` | Keep ESLint + Prettier for the package only |
| Storybook | Chromatic `main` permalink is the public Storybook; old Pages URL redirects; Chromatic runs only when Peak UI changes | Deploy to `percona/peak-ui` Pages from PMM; Pages on `percona/pmm` |
| Publishing | GitHub Actions in `percona/pmm` on release tag push, npm trusted publishing (OIDC) | Jenkins release stage; manual dispatch |
| Consumption | Workspace consumers import source; npm gets `dist` via `publishConfig` | `dist` everywhere |
| Changelog | Generated at pack time and shipped as `CHANGELOG.md`; "changed" means the package differs from the previous published one, and an identical release reads `No changes to Peak UI` | No changelog (only `git log`); hand-written changelog; deciding from commit titles or a folder diff |

## 1. Import and cutover

**Location:** `ui/packages/peak-ui/`, already matched by the workspace's `packages/*` glob. Package name stays `@percona/peak-ui`.

**History import:**

1. In a throwaway clone of `percona/peak-ui` at the freeze commit: `git filter-repo --to-subdirectory-filter ui/packages/peak-ui`, and drop all tags (the `v1.0.x` tags stay in the old repo and out of PMM's `v*` namespace).
2. On a PMM branch: `git merge --allow-unrelated-histories` from that clone.
3. If anything lands in `percona/peak-ui` during review, re-run steps 1–2 (filter-repo is deterministic) rather than hand-patching.

**One PR in `percona/pmm`, merged with "Create a merge commit"** (allowed on the repo). Commits, in order:

1. History merge.
2. Remove repo-level files PMM already provides: `.github/`, `pnpm-lock.yaml`, `.gitignore`, `.claude/`, `eslint.config.mjs`, `.prettierrc`, `.prettierignore`. `CLAUDE.md` and `CONTRIBUTING.md` stay in the package.
3. Workspace wiring (§2).
4. oxlint/oxfmt config switch.
5. oxfmt rewrap to 80 columns — nothing else in this commit.
6. Root `.git-blame-ignore-revs` listing commit 5 (merge commits preserve branch SHAs, so the entry stays valid; re-check it if the branch is rebased during review).
7. Consumers switch to `workspace:*` (§2).
8. Chromatic and publish workflows (§3, §4).
9. Docs and link rewrites (§5).

`main` is green at the merge commit; intermediate commits may not build, so bisect with `git bisect --first-parent`.

**Cutover order:**

1. Announce a freeze on `percona/peak-ui`; land #81 (the only ready PR).
2. Import from the freeze commit; open the PMM PR.
3. After it merges: deploy the redirect pages (§3), replace the README with a pointer, handle PRs and issues (§5), archive.
4. Draft-PR authors port their work themselves:

   ```sh
   git format-patch origin/main..HEAD --stdout | git -C ../pmm am -3 --directory=ui/packages/peak-ui
   cd ../pmm/ui && pnpm format
   ```

## 2. Workspace wiring

**`ui/packages/peak-ui/package.json`:**

- `main`, `types`, `exports` → `./src/index.ts`. `publishConfig` holds `access: public` plus today's `dist` values for `main`, `types` and `exports`; pnpm applies these overrides when packing.
- `version: "0.0.0"` in the tree; the real version only exists in the published tarball (§4).
- `files` adds `CHANGELOG.md`, which npm doesn't include on its own. CI generates it (§4); `ui/.gitignore` ignores `packages/peak-ui/CHANGELOG.md` so a local run never gets committed.
- Peer `react` / `react-dom`: `^18.3.1 || ^19.0.0`. Dev deps move to React 19 and `@types/react` 19, matching `apps/pmm`, so pnpm links one React, Emotion and MUI across the workspace (two Emotion copies mean two theme contexts and a silently unthemed UI).
- Drop the `react-is` 18.3.1 dependency and both `overrides` blocks. Package-level overrides are ignored in a workspace, only Storybook's alias uses `react-is`, and react-is 18 misreads React 19 elements. Add `react-is` as a dev dependency matching React 19 for that alias. Pinning it never helped npm consumers: a dependency cannot override MUI's own `react-is`.
- TypeScript → workspace `~6.0.3`. MUI resolves through the workspace's 7.3.11 override, so Peak UI is tested against the MUI PMM ships. Vite, Vitest and Storybook keep Peak UI's own versions (`apps/pmm` is on Vite 8; Storybook only needs the Vite it builds with).
- Scripts follow workspace names: `typecheck` → `check-types` (both tsconfigs), `lint` → `oxlint --config ../../oxlintrc.json src .storybook scripts`, `format` → `oxfmt --write .`, `format:check` → `oxfmt --check .` (oxfmt finds `ui/.oxfmtrc.json` from the package folder). `build` (Rollup), `test`, `storybook:dev`, `storybook:build`, `prepack` stay.
- `ui/oxlintrc.json` gains an override for `packages/peak-ui/**` that lifts the `material-react-table` import restriction: Peak UI's `Table` is the one place allowed to wrap it.

**Source changes:**

- Replace the `@/utils` alias with relative imports (10 files); remove `paths` from `tsconfig.json`, `tsconfigPaths()` from `vitest.config.ts` and `.storybook/main.ts`, and the `vite-tsconfig-paths` dev dependency.
- `tsconfig.json` extends `../../tsconfig.base.json`, so Peak UI's own `check-types` enforces what its consumers apply (`noImplicitReturns` and the rest).
- turbo's `build` now runs Peak UI's Rollup build in every `make ci`, catching a broken bundle long before a release.

**Consumers:**

- `apps/pmm`, `packages/extensions/framework`, `packages/plugins/atw`: `"@percona/peak-ui": "workspace:*"` in `dependencies`; the two `peerDependencies` entries become `workspace:*` too. `framework` and `atw` move from 1.0.26 to current; fix any breakage in the same commit.
- Remove `@percona/peak-ui` from `minimumReleaseAgeExclude` in `ui/pnpm-workspace.yaml`.
- Remove the `server.watch.ignored` entry for `node_modules/@percona/peak-ui` from `apps/pmm/vite.config.ts`; Vite resolves the workspace link to `packages/peak-ui/src`, which it already watches.
- Add `storybook-static` to `ui/.gitignore`.

## 3. CI, Chromatic and Storybook hosting

**Regular CI:** nothing new. `ui.yml` already runs `make ci` on `ui/` changes, covering format-check, lint, check-types, test and build for Peak UI. Its own `ci.yml` and `storybook.yml` are retired.

**`.github/workflows/peak-ui-chromatic.yml` in `percona/pmm`:**

- Paths: `ui/packages/peak-ui/**`, `ui/pnpm-workspace.yaml` (holds the MUI pin), and the workflow file itself. Lockfile-only dependency bumps don't trigger it.
- Triggers: `push` to `main` (refreshes the permalink); `pull_request` for same-repo branches; `pull_request_target` for forks, gated by a `chromatic-external` environment with required reviewers (the pattern `percona/peak-ui` uses today).
- Chromatic options: `workingDir: ui/packages/peak-ui`, `buildScriptName: storybook:build`, `onlyChanged: true` (TurboSnap), `exitZeroOnChanges: false`; checkout with `fetch-depth: 0` and, on PRs, the PR head ref.
- A full run is ~160 snapshots (31 story files, no modes). TurboSnap limits a one-component PR to its affected stories; `.storybook/` or `package.json` changes still snapshot everything.
- An unaccepted visual change fails the check; PMM's merge-gatekeeper waits on existing checks, so it blocks merge until someone accepts in Chromatic and re-runs the job. PRs that don't touch Peak UI never get the check. A fork PR waiting longer than the gatekeeper's 20-minute timeout for environment approval needs a gatekeeper re-run.

**Chromatic project:**

- Relink project `6a31152ea29e3a78e1060595` from `percona/peak-ui` to `percona/pmm`, keeping the app ID and therefore the permalink.
- Add `CHROMATIC_PROJECT_TOKEN` and the `chromatic-external` environment to `percona/pmm`, and give the Chromatic GitHub app access to `percona/pmm`.
- filter-repo changes every commit ID, so no earlier baselines match; the first `main` build on PMM sets a new baseline (one-time ~160 snapshots).

**Public Storybook:** `https://main--6a31152ea29e3a78e1060595.chromatic.com/` (verified 2026-11-12: `index.html` and `index.json` return 200 without login).

**Redirect on `percona/peak-ui` Pages**, deployed once after the PMM PR merges, then the repo is archived:

- `index.html`, `iframe.html` and `404.html` each `location.replace()` to the permalink, carrying over the same file name, the query (`?path=…`, `?id=…`) and the fragment. Every Storybook link in already-published `llms.txt` files keeps resolving.
- On 2026-11-12 Pages serves the last workflow deployment (`build_type: workflow`, last modified 2026-11-03); the `gh-pages` branch that #14's workflows push to is not live. The stubs go out through whichever source Pages uses at retirement: `actions/deploy-pages` for `workflow`, a single-commit push to `gh-pages` (dropping `pr-preview/`) for a branch source.

## 4. Publishing on PMM's release tag

**`.github/workflows/peak-ui-publish.yml` in `percona/pmm`:**

- Triggers: tag push matching `v[0-9]+.[0-9]+.[0-9]+` (not tied to 3.x); `workflow_dispatch` with inputs `version` (string) and `dry_run` (boolean).
- **`pack` job** (`contents: read` only):
  1. Check out the ref with full history and tags (`fetch-depth: 0`); `pnpm install --frozen-lockfile --filter @percona/peak-ui...`.
  2. `VERSION` = tag name without `v` on a tag ref, else the `version` input (required on a branch ref).
  3. Set `version` to `$VERSION` in the package; `pnpm pack` (runs `prepack` → build, applies `publishConfig`) for a candidate tarball.
  4. Previous release = the highest version on npm below `$VERSION`; download it with `npm pack @percona/peak-ui@<previous>`.
  5. Write `CHANGELOG.md` from the two tarballs and git (see Changelog below), write its newest entry to the job summary, and `pnpm pack` again so the final tarball includes it.
  6. Assert the tarball: `dist/index.js`, `dist/index.d.ts`, `AGENTS.md`, `llms.txt`, `CHANGELOG.md` present; packed `package.json` `main`/`types`/`exports` point at `dist/`, none at `src/`.
  7. `npm publish --dry-run <tarball>`; choose the dist-tag: `latest` when `$VERSION` is greater than the current `latest`, otherwise `release-<major>.<minor>` (a late patch on an older line must not move `latest` backwards); upload the tarball as a workflow artifact.
- **`publish` job** (`needs: pack`; runs only when `github.ref_type == 'tag'` and not `dry_run`; environment `npm`, restricted to `v*` tags; `id-token: write`; concurrency grouped per tag):
  1. Download the tarball; upgrade npm to ≥ 11.5.1 (first version with trusted publishing; Node 22 bundles npm 10).
  2. If `npm view @percona/peak-ui@$VERSION version` returns a value, exit successfully — re-runs are harmless.
  3. `npm publish <tarball> --provenance --access public --tag <dist-tag from pack>`. npm, not pnpm, uploads: npm does the OIDC exchange, and the tarball already went through pnpm's `publishConfig`.
- Every PMM release publishes, including patches where Peak UI is unchanged, so `3.10.1` always means "the Peak UI in PMM 3.10.1". Its changelog entry reads `No changes to Peak UI`.

**One-time setup:**

- npm admin on `@percona/peak-ui` adds a trusted publisher: GitHub Actions, `percona/pmm`, `peak-ui-publish.yml`, environment `npm`. After the first automated publish succeeds, set the package to disallow token publishing.
- `percona/pmm` admin creates the `npm` environment with a `v*` tag deployment rule.

**Timing:** a tag runs the workflow file as it exists at that tag. The first PMM release branch cut after the PMM PR merges publishes first; an earlier branch ships npm 1.0.x and publishes nothing. 1.0.x versions stay on npm, not deprecated.

**Changelog (`ui/packages/peak-ui/scripts/changelog.mjs`, version helpers in `scripts/versions.mjs`):** written at pack time and shipped in the tarball as `CHANGELOG.md`. Nothing is stored in the repo.

- **Previous release:** the highest version on npm below `$VERSION`, so a late 3.9.2 compares against 3.9.1, not 3.10.0.
- **Did anything change?** Compare the candidate tarball with the previous release's tarball file by file, ignoring the `version` field and `CHANGELOG.md`. This checks what ships rather than the history, so reverts, cherry-picks, and changes to stories or tests only all come out right. It also catches bundled dependencies: Rollup inlines `material-react-table` and `prism-react-renderer` into `dist/index.js`, so a lockfile-only bump changes the package without touching the Peak UI folder.
- **Identical package:** the entry is `No changes to Peak UI`.
- **Changed package:** one line per commit in `git log --no-merges --cherry-pick --right-only v<previous>...HEAD` that touches files that ship (`ui/packages/peak-ui/` minus stories, specs, MDX, `.storybook/`, `scripts/`, `CONTRIBUTING.md` and `CLAUDE.md`), using PMM's commit title. `--cherry-pick` drops fixes that already shipped in the previous release through a release-branch cherry-pick. Lines starting `BREAKING CHANGE:` in those commit messages go first, under "Breaking changes". With squash merges, the line has to be kept in the squash commit message.
- **Changed package, no such commits:** `Rebuilt with updated bundled dependencies; no Peak UI source changes.`
- **History:** the new entry is prepended to the `CHANGELOG.md` inside the previous release's tarball, so nothing older needs downloading. A late patch on an older line extends that line's history.
- **First release from PMM:** the previous release's tarball has no `CHANGELOG.md` (today that is 1.0.32), so the file starts fresh with one entry, `First release from the PMM monorepo. Continues from <previous>.`
- **Stable builds:** the comparison assumes the same inputs build the same files (Rollup and terser should). The dry run checks this by packing the same commit twice, before the first real release.
- The newest entry also goes into the job summary. PMM's GitHub Releases stay untouched; release engineering owns them.
- A Vitest spec covers: changed, identical, a bundled-dependency-only change, the first release, a breaking-change line, and a patch on an older line.

Example (versions illustrative):

```markdown
# Changelog

## 3.12.2 (<tag date>)

Rebuilt with updated bundled dependencies; no Peak UI source changes.

## 3.12.1 (<tag date>)

No changes to Peak UI

## 3.12.0 (<tag date>)

### Breaking changes

- <BREAKING CHANGE line from a commit message>

### Changes

- PMM-#### <commit title> (#<PR>)

## 3.11.0 (<tag date>)

First release from the PMM monorepo. Continues from 1.0.32.
```

## 5. Docs and retiring the old repo

**Package docs:**

- `README.md`: Storybook → permalink; development commands via the workspace (`pnpm --filter @percona/peak-ui storybook:dev`, or the scripts from the package folder); "Publishing" replaced by "versions follow PMM, published automatically from PMM's release tag; each version ships a generated `CHANGELOG.md`".
- `CONTRIBUTING.md`: safety gate becomes `pnpm check-types && pnpm lint && pnpm format:check && pnpm test`; ESLint references → oxlint; drop the pnpm 10 install warning; add "Porting a PR from percona/peak-ui" with the §1 command; add that an API-breaking PR keeps a `BREAKING CHANGE:` line in its squash commit message so it reaches the changelog.
- `AGENTS.md` (shipped): repository and Storybook links.
- `llms.txt`: 73 Storybook links → permalink; 49 GitHub links → `https://github.com/percona/pmm/blob/main/ui/packages/peak-ui/…`.
- `llms-txt.spec.ts` and `package-manifest.spec.ts` expect the new URL prefixes and script names.
- `package.json`: `repository: { type: git, url: git+https://github.com/percona/pmm.git, directory: ui/packages/peak-ui }`, `homepage` → permalink, `bugs` → `https://perconadev.atlassian.net/projects/PMM`.

**PMM docs:**

- `ui/README.md`: delete "Link a local `@percona/peak-ui` checkout"; delete "Locally testing @percona/peak-ui" from `ui/apps/pmm/README.md`; delete the commented peak-ui volume in `docker-compose.dev.yml`.
- `ui/AGENTS.md`: Peak UI section and Storybook catalog link → permalink and `packages/peak-ui/` (its `AGENTS.md` and `llms.txt` instead of `node_modules`); add one line: change components in place — one PR can touch Peak UI and its consumers.
- CODEOWNERS: `/ui/` (`pmm-review-fe`) already covers the package; the new workflows under `/.github/` bring in `pmm-review-be`.

**`percona/peak-ui` after the merge:**

1. Final commit: README → pointer (new location, Storybook, porting command); redirect pages deployed.
2. PRs: #81 lands before the freeze; drafts #17, #22, #71, #73, #76, #80 closed with a comment linking the porting command.
3. Issues: #79 closed by #81 (same `q=undefined` bug); #15, #42, #52, #61 re-filed in PMM Jira (Frontend) and closed with links. #42 (Storybook ahead of npm) remains true — the permalink shows `main` — but PMM itself no longer drifts.
4. Archive.

## Verification

1. `git log -- ui/packages/peak-ui/src/components/chip` in PMM shows pre-import commits; GitHub blame skips the rewrap commit.
2. `make ci` from `ui/` passes; `pnpm ls -r react react-dom @emotion/react @mui/material --depth 0` shows one version of each.
3. Editing a Peak UI component hot-reloads in PMM's `pnpm dev` with the theme applied.
4. A PR touching `ui/packages/peak-ui/` runs Chromatic with TurboSnap; a PR that doesn't, doesn't.
5. `https://percona.github.io/peak-ui/?path=/docs/foundations-surfaces--docs` lands on the same story on the permalink.
6. `workflow_dispatch` on `main` with `version: 3.99.0-dryrun`, `dry_run: true` passes the `pack` job, skips `publish`, and the job summary shows the first-release changelog line (before the first PMM release; after it, the entry for the latest release's changes). Packing the same commit twice gives identical files.
7. The first PMM release after the merge appears on npm as `@percona/peak-ui@<version>` with a provenance badge.

## Prerequisites and risks

| # | Item | Owner | Status |
|---|---|---|---|
| P1 | Chromatic permalink public without login | — | Verified 2026-11-12 |
| P2 | Pages keeps serving after `percona/peak-ui` is archived | Check before archiving | Open |
| P3 | npm admin on `@percona/peak-ui` adds the trusted publisher | Current npm publisher | Open |
| P4 | `percona/pmm` admin adds `CHROMATIC_PROJECT_TOKEN`, `chromatic-external` and `npm` environments, and grants the Chromatic GitHub app access | `percona/pmm` admin | Open |
| P5 | Jenkins' `v3.x.y` tag push triggers Actions (only `GITHUB_TOKEN` pushes don't) | Confirm on first release; fallback `workflow_dispatch` on the tag | Open |
| P6 | Next release-branch cut date decides the first published version | Release manager | Open |
| R1 | Storybook 10 / Rollup TS plugin on TypeScript 6 | Caught by `make ci` in the PMM PR | — |
| R2 | If P2 fails, old links break | Fallback: keep `percona/peak-ui` unarchived but locked, serving only the redirect | — |
| F1 | `material-react-table` and `prism-react-renderer` are bundled into `dist` and also listed in `dependencies`, so npm users install an unused copy | Separate ticket | Not in this work |
