/**
 * API client for fetching race data
 */

/**
 * Fetch race data from the API
 *
 * @param {string} raceID - The raceID
 * @param {number} year - The race year
 * @returns {Promise<Object>} The race data
 */
export async function fetchRaceData(raceID, year) {
  try {
    // Construct the API URL
    const url = `/api/race/${raceID}/${year}`;

    // Fetch the data
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching race data:", error);
    throw error;
  }
}
