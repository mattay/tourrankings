import {
  CLASSIFICATION_TYPES,
  CLASSIFICATION_UI_OPTIONS,
  isValidClassificationType,
} from "@cycling/classification/classification";

/**
 * @param {import('@server/controllers/raceController').RaceContent} content
 * @param {number} [stage]
 * @param {string} [classification]
 * @returns {Object}
 */
export function racePagePresenter(content, stage = null, classification = null) {
  const keywords = ["cycling", "tour", "ranking", content.race?.raceName];

  const classifications = CLASSIFICATION_UI_OPTIONS.reduce(
    (results, option) => {
      const safeClassification = isValidClassificationType(classification)
        ? classification
        : null;
      const newOption = {
        ...option,
        active: Boolean(
          safeClassification && option.type === safeClassification,
        ),
      };

      if (option.type === CLASSIFICATION_TYPES.STAGE && content.results) {
        newOption.active = !classification || option.type === classification;
        results.push(newOption);
      } else if (option.type && content.classifications?.[option.type]) {
        results.push(newOption);
      }

      return results;
    },
    [],
  );

  return {
    title: "Tour Rankings",
    description: "A web application for tracking and ranking tours.",
    keywords,
    race: content.race,
    stage: content.stages[stage || content.stagesCompleted],
    classifications,
  };
}
