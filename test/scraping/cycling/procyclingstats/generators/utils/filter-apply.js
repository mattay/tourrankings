/**
 * Filter Application Utilities
 * Applies filters to extracted data with OR logic
 */

/**
 * Apply filter to data array
 * @param {Array} data - Array of records
 * @param {Object} filter - Filter configuration
 * @returns {Array} Filtered and sampled data
 */
export function applyFilter(data, filter) {
  if (!filter || Object.keys(filter).length === 0) {
    return data;
  }

  let filtered = data;

  // Apply OR logic for matching records
  if (filter.bibs?.length || filter.ranks?.length || filter.teams?.length) {
    filtered = data.filter(item => {
      // OR logic: include if matches ANY criteria
      if (filter.bibs?.length && filter.bibs.includes(item.bib)) return true;
      if (filter.ranks?.length && filter.ranks.includes(item.rank)) return true;
      if (filter.teams?.length && filter.teams.includes(item.team)) return true;
      return false;
    });
  }

  // Apply sample size limit
  if (filter.sample && filter.sample > 0) {
    // If includeWinner requested, ensure rank 1 is first
    if (filter.includeWinner) {
      const winner = filtered.find(r => r.rank === 1);
      const others = filtered.filter(r => r.rank !== 1);
      const sampledOthers = others.slice(0, filter.sample - 1);
      filtered = winner ? [winner, ...sampledOthers] : sampledOthers.slice(0, filter.sample);
    } else {
      filtered = filtered.slice(0, filter.sample);
    }
  }

  return filtered;
}
