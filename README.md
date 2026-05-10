# Outside Baseball

> *Statcast, translated.*

Outside Baseball builds context-driven metrics on top of MLB Statcast data — shaping advanced statistics into something smarter by layering in the situational context the raw numbers leave out.

Each project starts with a question that box scores can't answer, then builds original methodology on top of Statcast to answer it. The goal isn't to replicate what already exists — it's to surface the behavior that hides beneath it.

Live at **[outsidebaseball.com](https://outsidebaseball.com)**

Metric & notebook repository at **[https://github.com/aryankapoorr/baseball](https://github.com/aryankapoorr/baseball)**

---

## Current Metrics

| Metric | Abbrev | Description |
|---|---|---|
| Composure+ | `C+` | How well pitchers maintain their approach after adversity, scaled to a league average of 100 |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS 3.4 |
| Animation | Framer Motion 12 |
| Routing | React Router 7 |
| Data | AWS S3 (CSV per season) + PapaParse |
| Hosting | Firebase Hosting |
| Notebooks | Jupyter (rendered via react-markdown) |

---

## Project Structure

```
src/
├── components/
│   ├── common/        # Shared UI (SiteHeader, TabBar, SeasonSelector, …)
│   ├── home/          # Landing page components (HeroSection, ProjectPreview, …)
│   ├── sections/      # Per-metric page sections (Overview, Leaderboard, Methodology, Notebook)
│   └── shared/        # Cross-section components (PlayerDetailModal, PlayerCard, …)
├── contexts/          # ProjectContext — passes metric config to the tree
├── data/
│   ├── projects.js    # All metric definitions (config, text, data sources, stat groups)
│   └── site.js        # Global site metadata
├── pages/             # Route-level pages (HomePage, ProjectPage, NotebookPage)
├── services/          # projectService — S3 fetching and player map construction
└── utils/             # mlbLookup, scoreUtils, etc.
```

---

## Adding a New Metric

All metric configuration lives in `src/data/projects.js`. Append an entry to the `PROJECTS` array:

```js
{
  slug:     'my-metric',        // used in the URL: /my-metric
  name:     'My Metric+',       // full display name
  navLabel: 'My Metric+',       // shown in the site nav
  status:   'live',

  text: {
    tagline:           'One-line description of what the metric captures.',
    pageDescription:   'Shown beneath the tagline on the metric page.',
    metricLabel:       'My Metric+',
    metricAbbrev:      'MM+',             // used in tight/mobile layouts
    metricNote:        'League-average = 100',
    methodologyTitle:  'How My Metric+ is built',
    methodologyBlurb:  'A paragraph explaining the methodology.',
    notebookFilename:  'my-metric.ipynb',
    notebookPath:      '/my-metric/notebook',
    searchPlaceholder: 'Search pitcher…',
    entityLabel:       'pitcher',
    componentMetricsTitle: 'Component Metrics',
  },

  dataSource: {
    s3Base:           'https://your-bucket.s3.amazonaws.com',
    seasonsPath:      '/seasons.json',          // → { "seasons": [2021, 2022, …] }
    dataPattern:      '/data/my_metric_{year}.csv',
    notebookUrl:      'https://your-bucket.s3.amazonaws.com/notebooks/my-metric.ipynb',
    playerNameColumn: 'pitcher_name',
    scoreColumn:      'my_metric_plus',
    pitchCountColumn: 'pitch_count',
  },

  vizConfig: {
    scoreMin:            50,
    scoreMax:            160,
    leagueAverage:       100,
    pageSize:            10,
    leaderboardPageSize: 30,
    weightByPitches:     true,
    colorBands:          STANDARD_COLOR_BANDS,
  },

  // Grouped stats shown in the Methodology section
  statGroups: [
    {
      label: 'Group Label',
      note:  'lower = better',
      keys: [
        ['column_name', 'Display Label'],
      ],
    },
  ],

  // Columns shown in the player detail modal
  metricColumns: [
    { key: 'column_name', label: 'Display Label', lowerIsBetter: true },
  ],

  sections: [
    { id: 'overview',    label: 'Overview',    component: OverviewSection },
    { id: 'leaderboard', label: 'Leaderboard', component: LeaderboardSection },
    { id: 'methodology', label: 'Methodology', component: MethodologySection, scrollTarget: true },
  ],
  notebookSection:  NotebookSection,
  previewComponent: ProjectPreview,
}
```

The S3 bucket needs:
- `{s3Base}/seasons.json` → `{ "seasons": [2021, 2022, …] }`
- `{s3Base}/data/my_metric_{year}.csv` → one row per player with columns matching the config above

---

## Development

```bash
npm install
npm run dev        # start local dev server
npm run build      # production build
npm run deploy     # build + deploy to Firebase Hosting
```

---

## Notebooks & Methodology

The data pipelines, Jupyter notebooks, and underlying methodology for each metric live in the companion repository:
**[github.com/aryankapoorr/baseball](https://github.com/aryankapoorr/baseball)**

---

## Author

Built by [Aryan Kapoor](https://aryankapoor.web.app).

---

## License

MIT — see [LICENSE](LICENSE).
