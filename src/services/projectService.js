import Papa from 'papaparse';

const serviceCache = new Map();

export function createProjectService(config) {
  if (serviceCache.has(config.slug)) return serviceCache.get(config.slug);

  const { dataSource, vizConfig } = config;
  let cachedSeasons = null;

  async function fetchAvailableSeasons() {
    if (cachedSeasons) return cachedSeasons;
    const res = await fetch(`${dataSource.s3Base}${dataSource.seasonsPath}`);
    const { seasons } = await res.json();
    cachedSeasons = [...seasons].sort((a, b) => a - b);
    return cachedSeasons;
  }

  async function fetchSeason(yr) {
    const path = dataSource.dataPattern.replace('{year}', yr);
    const res = await fetch(`${dataSource.s3Base}${path}`);
    const text = await res.text();
    const { data } = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
    return data;
  }

  async function fetchAllSeasons() {
    const seasons = await fetchAvailableSeasons();
    const results = { seasons };
    await Promise.all(seasons.map(async (yr) => { results[yr] = await fetchSeason(yr); }));
    return results;
  }

  function buildPlayerMap(allData) {
    const { playerNameColumn, scoreColumn, pitchCountColumn } = dataSource;
    const seasons = allData.seasons ?? [];
    const map = new Map();

    for (const yr of seasons) {
      for (const row of allData[yr] ?? []) {
        const name = row[playerNameColumn];
        if (!name) continue;
        if (!map.has(name)) map.set(name, { byYear: {} });
        map.get(name).byYear[yr] = row;
      }
    }

    for (const [, entry] of map) {
      const years = Object.keys(entry.byYear).map(Number).sort((a, b) => a - b);
      let totalPitches = 0, weightedScore = 0;
      for (const yr of years) {
        const pitches = entry.byYear[yr][pitchCountColumn] ?? 1;
        const score   = entry.byYear[yr][scoreColumn]      ?? 0;
        totalPitches  += pitches;
        weightedScore += score * (vizConfig.weightByPitches ? pitches : 1);
      }
      entry.years        = years;
      entry.totalPitches = totalPitches;
      entry.overall      = vizConfig.weightByPitches
        ? (totalPitches > 0 ? weightedScore / totalPitches : 0)
        : (years.length  > 0 ? weightedScore / years.length  : 0);
    }

    return map;
  }

  const service = { fetchAvailableSeasons, fetchAllSeasons, buildPlayerMap };
  serviceCache.set(config.slug, service);
  return service;
}
