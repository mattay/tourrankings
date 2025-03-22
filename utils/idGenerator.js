export const generateId = {
  race: (raceCode, year) => `${raceCode}:${year}`,
  stage: (raceId, stageNumber) => `${raceId}:${stageNumber}`,
  result: (stageId, riderId) => `${stageId}:${riderId}`,
};
