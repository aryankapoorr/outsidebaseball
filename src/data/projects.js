import ProjectPreview from '../components/home/ProjectPreview';
import OverviewSection    from '../components/sections/OverviewSection';
import LeaderboardSection from '../components/sections/LeaderboardSection';
import MethodologySection from '../components/sections/MethodologySection';
import NotebookSection    from '../components/sections/NotebookSection';
import { STANDARD_COLOR_BANDS } from '../utils/scoreUtils';

export const PROJECTS = [
  {
    slug:     'composure',
    name:     'Composure+',
    navLabel: 'Composure+',
    status:   'live',

    // ── All user-visible text ─────────────────────────────────────────────────
    text: {
      tagline:               'How well do pitchers maintain their approach after adversity?',
      pageDescription:       'Ranked by Composure+, scaled to a league-average of 100.',
      metricLabel:           'Composure+',
      metricNote:            'League-average = 100',
      methodologyTitle:      'How Composure+ is built',
      methodologyBlurb:      'Composure+ measures how pitchers respond to adversity on a pitch-by-pitch basis. It combines 14 conditional rate statistics — each capturing behavior in the immediate pitch or plate appearance after a specific triggering event — then scales to a league-average of 100 so pitchers across seasons can be compared directly.',
      notebookFilename:      'composure.ipynb',
      notebookPath:          '/composure/notebook',
      searchPlaceholder:     'Search pitcher…',
      entityLabel:           'pitcher',
      componentMetricsTitle: 'Component Metrics',
    },

    // ── Data sources ──────────────────────────────────────────────────────────
    dataSource: {
      s3Base:            'https://outside-baseball-composure.s3.us-east-1.amazonaws.com',
      seasonsPath:       '/seasons.json',
      dataPattern:       '/data/composure_scores_{year}.csv',
      notebookUrl:       'https://outside-baseball-composure.s3.us-east-1.amazonaws.com/notebooks/composure.ipynb',
      playerNameColumn:  'pitcher_name',
      scoreColumn:       'composure_plus',
      pitchCountColumn:  'pitch_count',
    },

    // ── Visualization / scoring config ────────────────────────────────────────
    vizConfig: {
      scoreMin:        50,
      scoreMax:        160,
      leagueAverage:   100,
      pageSize:            10,
      leaderboardPageSize: 30,
      weightByPitches: true,
      colorBands:      STANDARD_COLOR_BANDS,
    },

    // ── Metric definitions ────────────────────────────────────────────────────
    statGroups: [
      {
        label: 'Walk Rates After Adversity',
        note:  'lower = better composure',
        keys: [
          ['walk_after_barrel',   'After Barrel'],
          ['walk_after_hard_hit', 'After Hard Hit'],
          ['walk_after_high_xba', 'After High xBA'],
          ['walk_after_walk',     'After Walk'],
        ],
      },
      {
        label: 'First-Pitch Ball Rate',
        note:  'lower = better composure',
        keys: [
          ['first_ball_after_barrel',   'After Barrel'],
          ['first_ball_after_hard_hit', 'After Hard Hit'],
          ['first_ball_after_high_xba', 'After High xBA'],
          ['first_ball_after_soft_hit', 'After Soft Contact'],
          ['first_ball_after_low_xba',  'After Low xBA'],
        ],
      },
      {
        label: 'Other Outcomes',
        keys: [
          ['walk_after_soft_hit', 'Walk% After Soft Contact'],
          ['walk_after_low_xba',  'Walk% After Low xBA'],
          ['hard_hit_after_walk', 'Hard Hit% After Walk'],
          ['hard_hit_after_soft', 'Hard Hit% After Soft Contact'],
          ['ball_after_foul',     'Ball% After Foul'],
        ],
      },
    ],

    metricColumns: [
      { key: 'walk_after_barrel',         label: 'BB% After Barrel',      lowerIsBetter: true },
      { key: 'walk_after_hard_hit',       label: 'BB% After Hard Hit',    lowerIsBetter: true },
      { key: 'walk_after_high_xba',       label: 'BB% After High xBA',    lowerIsBetter: true },
      { key: 'walk_after_walk',           label: 'BB% After Walk',        lowerIsBetter: true },
      { key: 'walk_after_soft_hit',       label: 'BB% After Soft Hit',    lowerIsBetter: true },
      { key: 'walk_after_low_xba',        label: 'BB% After Low xBA',     lowerIsBetter: true },
      { key: 'first_ball_after_barrel',   label: 'Ball% After Barrel',    lowerIsBetter: true },
      { key: 'first_ball_after_hard_hit', label: 'Ball% After Hard Hit',  lowerIsBetter: true },
      { key: 'first_ball_after_high_xba', label: 'Ball% After High xBA',  lowerIsBetter: true },
      { key: 'first_ball_after_soft_hit', label: 'Ball% After Soft Hit',  lowerIsBetter: true },
      { key: 'first_ball_after_low_xba',  label: 'Ball% After Low xBA',   lowerIsBetter: true },
      { key: 'hard_hit_after_walk',       label: 'HH% After Walk',        lowerIsBetter: true },
      { key: 'hard_hit_after_soft',       label: 'HH% After Soft Hit',    lowerIsBetter: true },
      { key: 'ball_after_foul',           label: 'Ball% After Foul',      lowerIsBetter: true },
    ],

    sections: [
      { id: 'overview',    label: 'Overview',    component: OverviewSection    },
      { id: 'leaderboard', label: 'Leaderboard', component: LeaderboardSection },
      { id: 'methodology', label: 'Methodology', component: MethodologySection, scrollTarget: true },
    ],
    notebookSection:  NotebookSection,
    previewComponent: ProjectPreview,
  },
];
