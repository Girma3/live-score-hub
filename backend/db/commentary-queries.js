import { get } from "http";
import prisma from "./pool.js";
async function createCommentary({
  matchId,
  minute,
  sequence,
  period,
  eventType,
  actor,
  team,
  message,
  metadata,
  tags,
  createdAt,
}) {
  if (!matchId) {
    throw new Error("Match ID is required");
  }
  try {
    const commentary = await prisma.commentary.create({
      data: {
        matchId,
        minute,
        sequence,
        period,
        eventType,
        actor,
        team,
        message,
        metadata,
        tags,
        createdAt,
      },
      include: {
        match: true, // optional: include match info if you want it in the response
      },
    });

    return commentary;
  } catch (error) {
    console.error("Error creating commentary:", error);
    throw new Error("Failed to create commentary");
  }
}

async function getLiveCommentary(matchId, limit = 10, period, eventType) {
  if (!matchId) {
    throw new Error("Match ID is required");
  }

  try {
    const commentaries = await prisma.commentary.findMany({
      where: {
        matchId,
        ...(period && { period }),
        ...(eventType && { eventType }),
      },
      orderBy: { createdAt: "desc" }, // latest first
      take: Math.min(limit, 50), // cap at 50
    });

    return commentaries;
  } catch (error) {
    console.error("Error fetching commentaries:", error);
    throw new Error("Failed to fetch live commentary");
  }
}

export { createCommentary, getLiveCommentary };
