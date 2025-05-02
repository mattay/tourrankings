/**
 * @typedef {Object} ClassificationGeneralModel
 * @property {string} stageId - Unique identifier for the stage.
 * @property {string} stage - Name of the stage.
 * @property {number} rank - Rank of the rider in the general classification.
 * @property {number} previousStageRanking - Rank of the rider in the previous stage.
 * @property {number} change - Change in rank from the previous stage.
 * @property {string} bib - Rider's bib number.
 * @property {string} specialty - Rider's specialty.
 * @property {string} rider - Rider's name.
 * @property {number} age - Rider's age.
 * @property {string} team - Rider's team.
 * @property {string} uci - Rider's UCI points won on stage.
 * @property {string} bonis - Bonis won on stage.
 * @property {string} time - Rider's time.
 * @property {string} delta - Rider's delta time.
 */

/** @typedef {Object} ClassificationYouthModel -
 * @property {number} stageId - The unique identifier for the stage.
 * @property {string} stage - The name of the stage.
 * @property {number} rank - The rank of the rider in the stage.
 * @property {number} previousStageRanking - The rank of the rider in the previous stage.
 * @property {number} change - The change in rank from the previous stage.
 * @property {number} bib - The unique identifier for the rider.
 * @property {string} specialty - The specialty of the rider.
 * @property {string} rider - The name of the rider.
 * @property {number} age - The age of the rider.
 * @property {string} team - The name of the team the rider is part of.
 */

/** @typedef {Object} ClassificationPointModel
 * @property {number} stageId - The unique identifier for the stage.
 * @property {string} stage - The name of the stage.
 * @property {number} rank - The rank of the rider in the classification.
 * @property {number} previousStageRanking - The rank of the rider in the previous stage.
 * @property {number} change - The change in rank from the previous stage.
 * @property {number} bib - The unique identifier for the rider.
 * @property {string} specialty - The specialty of the rider.
 * @property {string} rider - The name of the rider.
 * @property {number} age - The age of the rider.
 * @property {string} team - The name of the team the rider is part of.
 * @property {number} points - The points earned by the rider in the classification.
 * @property {number} today - The points earned by the rider in the current stage.
 * @property {number} bonis - The bonus points earned by the rider in the classification.
 * @property {string} time - The time taken by the rider to complete the stage.
 * @property {string} delta - The time difference between the rider and the leader.
 */

/** @typedef {Object} ClassificationMountainModel
 * @property {number} stageId - The unique identifier for the stage.
 * @property {number} stage
 * @property {number} rank - The rank of the rider in the mountain classification.
 * @property {number} previousStageRanking - The rank of the rider in the previous stage.
 * @property {number} change - The change in rank from the previous stage.
 * @property {number} bib - The unique identifier for the rider.
 * @property {string} specialty - The specialty of the rider.
 * @property {string} rider - The name of the rider.
 * @property {number} age - The age of the rider.
 * @property {string} team - The name of the team.
 * @property {number} points - The points earned by the rider.
 * @property {number} today - The points earned by the rider in the current stage.
 */

/** @typedef {Object} ClassificationTeamModel -
 * @property {number} stageId - The unique identifier for the stage.
 * @property {string} stage - The name of the stage.
 * @property {number} rank - The rank of the team in the stage.
 * @property {number} previousStageRanking - The rank of the team in the previous stage.
 * @property {number} change - The change in rank from the previous stage.
 * @property {string} team - The name of the team.
 * @property {string} class - The classification of the team.
 * @property {string} time - The time taken by the team to complete the stage.
 * @property {string} delta - The time difference between the team's time and the fastest time.
 */

export {};
