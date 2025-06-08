import { raceContent } from "./raceController.js";
import { logOut } from "../../src/utils/logging.js";

/**
 * Get race data as JSON
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export function getRaceData(req, res) {
  logOut("API", "getRaceData");
  try {
    const { racePcsID } = req.params;
    const year = req.params.year
      ? parseInt(req.params.year)
      : new Date().getFullYear();
    // const stage = req.params.stage ? parseInt(req.params.stage) : null;

    logOut("API", `Fetching race data for ${racePcsID} ${year}`);

    const content = raceContent(racePcsID, year);
    // TODO Remove references to PCS

    res.json(content);
  } catch (error) {
    logOut("API", "fetching race data", error);
    res.status(500).json({
      error: "Failed to fetch race data",
      message: error.message,
    });
  }
}
