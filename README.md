# Second Cast — Techno-Economic Interactive Model

Interactive embodied carbon and Midwest cost model for **Second Cast: Functionally Graded Composite Walls from Recycled Concrete and Foam-Crete** (ACADIA 2026 project submission).

## Live site

After GitHub Pages is enabled for this repository, the app is published at:

**https://jamessotiroff.github.io/Second-Cast-Thesis-2026/**

Enable Pages under **Settings → Pages → Build and deployment → GitHub Actions**.

## Thesis PDF

The ACADIA submission is versioned in this repository:

- App path: [`/Second-Cast-Thesis-2026/docs/ACADIA_2026_Second_Cast.pdf`](public/docs/ACADIA_2026_Second_Cast.pdf)
- GitHub: [View PDF on GitHub](https://github.com/JamesSotiroff/Second-Cast-Thesis-2026/blob/main/public/docs/ACADIA_2026_Second_Cast.pdf)

## Model scope

The interactive model implements drivers from the submission:

- 4'-0" × 4'-0" × 4" wall panels
- Solid, optimized, and king-stud scenarios
- Up to 33% mass reduction and ~30% embodied carbon savings (manufacturing + transport)
- 26-panel flatbed batching and configurable haul distance
- Midwest presets: Ann Arbor, Detroit, Chicago, Columbus
- Configurable emission factors and Midwest unit costs ($/kg, $/panel, $/km)

Operational energy / thermal performance is excluded, matching the submission scope.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000/Second-Cast-Thesis-2026/](http://localhost:3000/Second-Cast-Thesis-2026/).

Build static export:

```bash
npm run build
```

Output is written to `out/` for GitHub Pages deployment.

## Project structure

```
src/lib/model/          Pure TypeScript calculation engine
src/data/midwest/       Regional presets and defaults
src/components/         Dashboard UI, charts, PDF reference
public/docs/            ACADIA 2026 submission PDF
```

## Citation

James Sotiroff. *Second Cast: Functionally Graded Composite Walls from Recycled Concrete and Foam-Crete.* ACADIA 2026 Project Submission.

PDF: `public/docs/ACADIA_2026_Second_Cast.pdf`
