/**
 * Sorts an array of objects by their a Date property.
 *
 * @param {Array<Object>} arr - The array to sort.
 * @param {string} key - The property to sort by.
 * @param {'asc'|'desc'} [direction='asc'] - Sort direction: 'asc' for ascending, 'desc' for descending.
 * @returns {Array<Object>} The sorted array.
 */
export function sortByDate(arr, key, direction = "asc") {
  return arr.sort((a, b) => {
    const dateA = new Date(a[key]);
    const dateB = new Date(b[key]);
    if (direction === "desc") {
      return dateB - dateA;
    }
    return dateA - dateB;
  });
}
