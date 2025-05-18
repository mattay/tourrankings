/**
 *
 * @param {RawRiderStageResults} rider
 * @returns {RiderStageResults} rider
 */
export function parseRiderStageResults(rider) {
  // return rider.map((stage) => {
  // if (!stage) return stage;

  // const cleanedStage = {};
  // for (const key of Object.keys(stage)) {
  //   let value = stage[key];
  //   switch (key) {
  //     case "Stage":
  //     case "BIB":
  //     case "GC":
  //     case "Rank":
  //     case "Age":
  //       if (value != "-" && value != "") {
  //         value = parseInt(value, 10);
  //       } else if (value == "-") {
  //         value = "";
  //       }
  //       break;
  //     default:
  //       break;
  //   }
  //   cleanedStage[key] = value;
  // }
  // return cleanedStage;
  // // });
  return {
    ...rider,
  };
}
