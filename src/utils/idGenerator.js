export const generateId = {
  race: (raceCode, year) => `${raceCode}:${year}`,
  stage: (racePcsID, stageNumber) => `${racePcsID}:${stageNumber}`,
  result: (stageId, riderId) => `${stageId}:${riderId}`,
};
