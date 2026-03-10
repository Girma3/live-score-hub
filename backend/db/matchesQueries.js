import prisma from "./pool.js";

export const getMatches = async () => {
  try {
    const matches = await prisma.match.findMany();
    return matches;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
};
