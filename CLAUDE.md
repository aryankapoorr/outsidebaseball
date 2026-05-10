# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React + Vite frontend for Outside Baseball — a site that publishes custom baseball analytics metrics. Deployed to Firebase Hosting. Data is served from AWS S3; there is no backend.

**Stack:** React 19, React Router, Tailwind CSS, Vite, Firebase Hosting

## Project Architecture

The entire site is driven by a single `PROJECTS` array in `src/data/projects.js`. Each entry is self-contained: it defines the project's text, data sources, visualization config, metric definitions, and which page sections to render. Adding a new project means adding one entry to this file — no routing, service, or component changes needed.

### Routing
`App.jsx` generates routes from `PROJECTS` automatically:
- `/{slug}` → `ProjectPage` (the main project page)
- `/{slug}/notebook` → `NotebookPage` (full-page notebook viewer)

### Data flow
1. `ProjectPage` calls `fetchAllComposureSeasons(project.dataSource)` from `src/services/projectService.js`
2. The service fetches `{s3Base}/seasons.json` to discover available years, then fetches each year's CSV
3. Data is passed to section components (`OverviewSection`, `LeaderboardSection`, etc.) via props

### S3 assets per project
Each project has a dedicated S3 bucket named `outside-baseball-{slug}` with this structure:
```
outside-baseball-{slug}/
  notebooks/{slug}.ipynb     ← fetched by NotebookViewer
  data/{csv files}           ← fetched by projectService
  seasons.json               ← auto-generated list of available years
```
Assets are synced automatically from the `aryankapoorr/baseball` GitHub repo on every push to `main` (see that repo's `projects.json` and `.github/workflows/sync-to-s3.yml`).

Player headshots are stored separately in `outside-baseball-headshots/headshots/{mlbId}.jpg`.

## Adding a New Project

1. **Data repo** (`aryankapoorr/baseball`): add a folder + entry in `projects.json`, create the S3 bucket manually. See that repo's CLAUDE.md for the exact steps.

2. **Web repo** (`src/data/projects.js`): add an entry to `PROJECTS`. Minimum required fields:
```js
{
  slug: 'my-metric',
  name: 'My Metric+',
  status: 'live',          // or 'coming-soon'
  text: { /* all UI strings */ },
  dataSource: {
    s3Base:           'https://outside-baseball-my-metric.s3.us-east-1.amazonaws.com',
    seasonsPath:      '/seasons.json',
    dataPattern:      '/data/my_metric_scores_{year}.csv',
    notebookUrl:      'https://outside-baseball-my-metric.s3.us-east-1.amazonaws.com/notebooks/my-metric.ipynb',
    playerNameColumn: 'pitcher_name',   // CSV column for the entity name
    scoreColumn:      'my_metric_plus', // CSV column for the primary score
    pitchCountColumn: 'pitch_count',
  },
  vizConfig: { /* score range, page sizes, color bands */ },
  statGroups:    [ /* metric definitions for the methodology section */ ],
  metricColumns: [ /* columns for the leaderboard table */ ],
  sections: [
    { id: 'overview',    label: 'Overview',    component: OverviewSection    },
    { id: 'leaderboard', label: 'Leaderboard', component: LeaderboardSection },
    { id: 'methodology', label: 'Methodology', component: MethodologySection, scrollTarget: true },
  ],
  notebookSection:  NotebookSection,
  previewComponent: ProjectPreview,
}
```

## Key Files

| File | Purpose |
|------|---------|
| `src/data/projects.js` | Single source of truth for all projects |
| `src/services/projectService.js` | Generic data fetching (seasons manifest + CSVs) |
| `src/pages/ProjectPage.jsx` | Main project page, section rendering |
| `src/pages/NotebookPage.jsx` | Full-page notebook viewer |
| `src/components/shared/NotebookViewer.jsx` | Renders `.ipynb` JSON from S3 (markdown + code cells, no outputs) |
| `src/components/common/SeasonSelector.jsx` | Season tabs — receives `seasons` prop, fully dynamic |
| `src/utils/mlbLookup.js` | Resolves pitcher names to MLB IDs; serves headshots from S3 |
| `scripts/uploadHeadshots.mjs` | One-time script to populate `outside-baseball-headshots` bucket |

## Deployment

```bash
npm run build && firebase deploy --only hosting
```

The site is hosted on Firebase. No server — all data comes from public S3 URLs at runtime.
