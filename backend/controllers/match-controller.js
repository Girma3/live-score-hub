import {
  listMatchQueryValidation,
  MatchSchema,
} from "../validation/match-validation.js";
import { createMatch, getAllMatches } from "../db/matches-queries.js";
import { getMatchStatus } from "../utils/match-status.js";
const MAX_LIMIT = 100; //limit for to fetch matches
async function createNewMatch(req, res) {
  const parsedData = MatchSchema.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({ error: parsedData.error.issues });
  }
  const { startTime, endTime } = parsedData.data;
  try {
    const matchStatus = await getMatchStatus(startTime, endTime);
    const match = await createMatch({
      ...parsedData.data,
      status: matchStatus,
    });

    //for web socket
    if (res.app.locals.broadcastMatchCreated) {
      //  the API response work even if z broadcast failed
      try {
        res.app.locals.broadcastMatchCreated(match);
      } catch (broadcastError) {
        console.error("WebSocket broadcast failed:", broadcastError);
      }
    }

    return res
      .status(201)
      .json({ message: "Match created successfully", data: match });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to create match", detail: error });
  }
}

async function getMatches(req, res) {
  const parsed = listMatchQueryValidation.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      detail: parsed.error.issues,
    });
  }
  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);
  try {
    const matches = await getAllMatches(limit);
    return res.status(200).json({ data: matches });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch matches" });
  }
}
export { createNewMatch, getMatches };
