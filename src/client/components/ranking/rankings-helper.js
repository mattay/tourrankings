import { formatSeconds } from "src/utils/time";
import { getStringWidth } from "../canvas/textSizing";

/**
 * Partial
 * @param {import('@client/state/store/@types/store').Labels} labels
 * @param {d3.Selection} canvas
 * @returns {import('@client/state/store/@types/store').Labels}
 */
export function calculateRankingLabelSize(labels, canvas) {
  const rankingLabels = { ...labels };

  // Tempory
  const canvasInpector = canvas
    .append("g")
    .attr("id", "canvasInpector")
    .style("visibility", "hidden");

  for (const label in labels) {
    let characterWidth = 0;
    switch (label) {
      case "bib":
      case "rank":
      case "points":
        characterWidth = getStringWidth(
          canvasInpector,
          ["ranking", "label"],
          "",
          String(labels[label].maxValue || 123),
        );
        break;
      case "time":
        characterWidth = getStringWidth(
          canvasInpector,
          ["ranking", "label"],
          "",
          formatSeconds(labels[label].maxValue || 0),
        );
        break;
      default:
        characterWidth = getStringWidth(
          canvasInpector,
          ["ranking", "label"],
          "",
          "X".repeat(labels[label].maxChars),
        );
        break;
    }
    rankingLabels[label].characterWidth = Math.floor(characterWidth / 4) * 4;
  }

  canvasInpector.remove();

  return rankingLabels;
}
