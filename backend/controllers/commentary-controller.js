import { matchIdParamsValidation } from "../validation/match-validation.js";
import {
  commentaryValidation,
  commentaryQueryValidation,
} from "../validation/commentary-validation.js";
import {
  createCommentary,
  getLiveCommentary,
} from "../db/commentary-queries.js";
async function newCommentary(req, res) {
  const paramsResult = matchIdParamsValidation.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      error: "Invalid matchId parameter",
      detail: paramsResult.error.issues,
    });
  }

  const bodyResult = commentaryValidation.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      error: "Invalid request body",
      detail: bodyResult.error.issues,
    });
  }

  const { matchId } = paramsResult.data;
  const { ...commentaryData } = bodyResult.data;

  try {
    const commentary = await createCommentary({
      ...commentaryData,
      matchId,
    });

    //for web socket
    if (res.app.locals.broadcastCommentary) {
      //  the API response work even if z broadcast failed
      try {
        res.app.locals.broadcastCommentary(commentary.matchId, commentary);
      } catch (broadcastError) {
        console.error("WebSocket broadcast failed:", broadcastError);
      }
    }

    return res
      .status(201)
      .json({ message: "Commentary created successfully", data: commentary });
  } catch (error) {
    console.error("Failed to create commentary:", error);
    return res.status(500).json({ error: "Failed to create commentary" });
  }
}

async function getCommentaryFeed(req, res) {
  // Validate params
  const paramsResult = matchIdParamsValidation.safeParse(req.params);
  if (!paramsResult.success) {
    return res.status(400).json({
      error: "Invalid matchId parameter",
      detail: paramsResult.error.issues,
    });
  }

  // Validate query
  const queryResult = commentaryQueryValidation.safeParse(req.query);
  if (!queryResult.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      detail: queryResult.error.issues,
    });
  }

  const { matchId } = paramsResult.data;
  const { limit, period, eventType } = queryResult.data;

  try {
    const commentaries = await getLiveCommentary(
      matchId,
      limit,
      period,
      eventType,
    );
    console.log(commentaries);

    return res.status(200).json({
      message: "Live commentary feed",
      data: commentaries,
    });
  } catch (error) {
    console.error("Failed to fetch commentary:", error);
    return res.status(500).json({ error: "Failed to fetch commentary" });
  }
}

export { newCommentary, getCommentaryFeed };
