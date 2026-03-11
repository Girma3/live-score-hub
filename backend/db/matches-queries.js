import prisma from "./pool.js";

async function createMatch(matchData) {
  if (!matchData) {
    throw new Error("Match data is required to create a match.");
  }
  try {
    const existingMatch = await prisma.match.findFirst({
      where: {
        homeTeam: matchData.homeTeam,
        awayTeam: matchData.awayTeam,
        startTime: matchData.startTime,
        sport: matchData.sport,
      },
    });
    if (existingMatch) {
      return existingMatch;
    }
    const newMatch = await prisma.match.create({
      data: matchData,
    });

    return newMatch;
  } catch (error) {
    console.error("Error creating match:", error);
    throw error;
  }
}

async function getAllMatches({ limit = 50, status, sport }) {
  try {
    const matches = await prisma.match.findMany({
      take: limit,
      where: {
        ...(status ? { status } : {}),
        ...(sport ? { sport } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return matches;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
}

export { createMatch, getAllMatches };
