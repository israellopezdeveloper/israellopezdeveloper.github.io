# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager: **pnpm** (see `pnpm-lock.yaml`, `.npmrc`, CI uses `corepack pnpm@9`).

- `pnpm dev` — Vite dev server
- `pnpm build` — production build (output in `build/`, prerendered static site via `@sveltejs/adapter-static`)
- `pnpm preview` — preview built site
- `pnpm check` — `svelte-kit sync` + `svelte-check` (TypeScript / Svelte type checking)
- `pnpm lint` — `prettier --check . && eslint .`
- `pnpm format` — apply Prettier

There is no test runner configured; do not invent one.

### Pre-build data generation (run before `pnpm build` if data sources changed)

These scripts must run before `pnpm build` so generated TS/PDF assets exist (CI in `.gitlab-ci.yml` runs them in this order):

```bash
pnpm exec tsx src/script/cv-nn.ts    --input src/lib/data/data_CV.json       --output src/lib/data/nn_works.ts
pnpm exec tsx src/script/repos-nn.ts --input src/lib/data/data_projects.json --output src/lib/data/nn_projects.ts
node       src/script/cv-pdf.js                 src/lib/data/data_CV.json       static/CV.pdf
```

`src/script/get-repos.ts` is a utility to refresh `data_projects.json` from GitHub (not run in CI).

## Architecture

**SvelteKit 2 + Svelte 5 + TypeScript**, fully prerendered static site (deployed to GitHub Pages and GitLab Pages — `.gitlab-ci.yml` renames `build/` → `public/` for GitLab).

### Sveltex (Markdown + Math)

`svelte.config.js` registers `.sveltex` as an additional extension and chains `vitePreprocess` with the Sveltex preprocessor configured in `sveltex.config.js` (unified-based Markdown, MathJax SVG output via hybrid CDN CSS). Blog posts live in `src/lib/data/posts/*.sveltex` and are imported as Svelte components — they are not loose Markdown files; they compile through the Svelte pipeline.

### Data flow: JSON → generated TS → 3D neural-net visual

The "neural network" hero/visual is data-driven:

1. Hand-edited sources of truth: `src/lib/data/data_CV.json` (work history) and `src/lib/data/data_projects.json` (repos).
2. Pre-build scripts in `src/script/` transform those JSONs into `src/lib/data/nn_works.ts` and `src/lib/data/nn_projects.ts` — typed `ModelNode[]` structures (id / label / layers / neurons) consumed by the `@israellopezdeveloper/nn3d` Three.js component in `src/lib/components/three/`.
3. `src/script/cv-pdf.js` renders the CV JSON to `static/CV.pdf` via `pdfkit`.

When editing CV/project content, edit the JSON and regenerate — do **not** edit `nn_works.ts` / `nn_projects.ts` directly (they are build artifacts checked into the repo).

### Routing

- `src/routes/+page.svelte` — single-page portfolio composed of section components in `src/routes/sections/` (HeroAbout, Experience, Education, TechStack, Services, SocialProof, HowIWork, Posts, Contact).
- `src/routes/services/[slug]/+page.svelte` — per-service detail pages, prerendered (`+page.ts` sets `prerender = true`); slug list comes from `src/lib/data/services.ts`.
- Reusable cards/modals (Work, Project, Post) live in `src/lib/components/`; `ClientOnly.svelte` gates browser-only (Three.js, GSAP) rendering during SSR/prerender.

### Static-site constraints

`adapter-static` + `prerender = true` means: no server endpoints, no runtime `fetch` to private APIs, no dynamic params outside what the prerender crawler can discover. Three.js / GSAP / NN3D code must be guarded for SSR (use `ClientOnly.svelte` or `onMount`).

## Conventions

- Prettier config: 2-space, single quotes, no trailing commas, 100-col, includes `prettier-plugin-svelte`. Run `pnpm format` before committing UI changes.
- ESLint flat config (`eslint.config.js`) covers TS + Svelte; `.svelte-kit/`, `build/`, `node_modules/`, generated `nn_*.ts` should not be hand-linted.
- `TODO.md` is the author's working notes — treat as read-only context unless asked to update it.
