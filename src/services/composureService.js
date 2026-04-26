import Papa from 'papaparse';

export const SEASONS = [2023, 2024, 2025];
export const PAGE_SIZE = 25;

export const STAT_GROUPS = [
  {
    label: 'Walk Rates After Adversity',
    note: 'lower = better composure',
    keys: [
      ['walk_after_barrel',   'After Barrel'],
      ['walk_after_hard_hit', 'After Hard Hit'],
      ['walk_after_high_xba', 'After High xBA'],
      ['walk_after_walk',     'After Walk'],
    ],
  },
  {
    label: 'First-Pitch Ball Rate',
    note: 'lower = better composure',
    keys: [
      ['first_ball_after_barrel',    'After Barrel'],
      ['first_ball_after_hard_hit',  'After Hard Hit'],
      ['first_ball_after_high_xba',  'After High xBA'],
      ['first_ball_after_soft_hit',  'After Soft Contact'],
      ['first_ball_after_low_xba',   'After Low xBA'],
    ],
  },
  {
    label: 'Other Outcomes',
    keys: [
      ['walk_after_soft_hit',  'Walk% After Soft Contact'],
      ['walk_after_low_xba',   'Walk% After Low xBA'],
      ['hard_hit_after_walk',  'Hard Hit% After Walk'],
      ['hard_hit_after_soft',  'Hard Hit% After Soft Contact'],
      ['ball_after_foul',      'Ball% After Foul'],
    ],
  },
];

// All 14 component metric columns for the full table view
export const METRIC_COLUMNS = [
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
];

async function fetchSeason(yr) {
  // Future: replace with API call → const res = await fetch(`/api/composure?season=${yr}`);
  const res  = await fetch(`/data/composure_scores_${yr}.csv`);
  const text = await res.text();
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
  return data;
}

export async function fetchComposureData(season) {
  return fetchSeason(season);
}

export async function fetchAllComposureSeasons() {
  const results = {};
  await Promise.all(SEASONS.map(async (yr) => { results[yr] = await fetchSeason(yr); }));
  return results;
}

export function buildPlayerMap(allData) {
  const map = new Map();
  for (const yr of SEASONS) {
    for (const row of allData[yr] ?? []) {
      const name = row.pitcher_name;
      if (!name) continue;
      if (!map.has(name)) map.set(name, { byYear: {} });
      map.get(name).byYear[yr] = row;
    }
  }
  for (const [, entry] of map) {
    const years = Object.keys(entry.byYear).map(Number).sort();
    let totalPitches = 0, weightedScore = 0;
    for (const yr of years) {
      totalPitches  += entry.byYear[yr].pitch_count;
      weightedScore += entry.byYear[yr].composure_plus * entry.byYear[yr].pitch_count;
    }
    entry.years        = years;
    entry.overall      = totalPitches > 0 ? weightedScore / totalPitches : 0;
    entry.totalPitches = totalPitches;
  }
  return map;
}
