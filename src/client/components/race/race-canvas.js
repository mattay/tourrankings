/** @typedef {import('./@types/index').Margin} Margin */
/** @typedef {import('./@types/index').Coordinates} Coordinates */

/**
 * Adds together top, height, and bottom from a coordinates object.
 * @param {Coordinates} coordinates
 * @returns {number}
 */
export function containerHeight(coordinates) {
  return (
    Number(coordinates.top) +
    Number(coordinates.height) +
    Number(coordinates.bottom)
  );
}

/**
 * Calculates the layout coordinates for stages and rankings containers.
 * @param {number} innerWidth
 * @param {number} innerHeight
 * @param {Margin} margins
 * @param {object[]} dataLabels
 * @returns {{stages: Coordinates, rankings: Coordinates}}
 */
export function calculateCoordinates(
  innerWidth,
  innerHeight,
  margins,
  dataLabels,
) {
  const numberOfRiders = dataLabels.filter((element) => element != null).length;
  const { top, right, bottom, left } = margins;
  const riderLabelWidth = 240;
  const riderLabelHeight = 20;
  const riderRankingHeight = numberOfRiders * riderLabelHeight;

  const stagesCoordinates = {
    top,
    bottom: 32,
    left,
    right: innerWidth - right,
    width: innerWidth - riderLabelWidth,
    height: 40,
  };

  const rankingsCoordinates = {
    top,
    bottom,
    left,
    right: innerWidth - right,
    width: innerWidth - riderLabelWidth,
    height: numberOfRiders ? riderRankingHeight : innerHeight,
  };

  return {
    stages: stagesCoordinates,
    rankings: rankingsCoordinates,
  };
}
