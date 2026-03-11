import { z } from "zod";

// Commentary schema
const CommentarySchema = z.object({
  id: z.number().optional(),
  matchId: z.number(),
  match: z.object({
    id: z.number(),
  }),
  minute: z.number(),
  sequence: z.number(),
  period: z.enum(["FIRST_HALF", "SECOND_HALF", "EXTRA_TIME", "PENALTIES"]),
  eventType: z.enum(["GOAL", "FOUL", "SUBSTITUTION", "GENERAL"]),
  actor: z.string().nullable(),
  team: z.string().nullable(),
  message: z.string(),
  metadata: z.json().nullable(),
  tags: z.array(z.string()),
  createdAt: z.date().default(new Date()),
});
// Match schema
const MatchSchema = z.object({
  id: z.number().optional(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  homeTeamScore: z.number().default(0),
  awayTeamScore: z.number().default(0),
  status: z
    .enum([
      "PENDING",
      "SCHEDULED",
      "LIVE",
      "HALFTIME",
      "FINISHED",
      "POSTPONED",
      "CANCELLED",
      "IN_REVIEW",
    ])
    .default("SCHEDULED"),
  startTime: z
    .string()

    .transform((val) => new Date(val)),
  endTime: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : null)),
  createdAt: z.date().default(new Date()),
  sport: z
    .enum(["FOOTBALL", "BASKETBALL", "TENNIS", "VOLLEYBALL"])
    .transform((val) => val.toUpperCase()),

  commentaries: z.array(CommentarySchema).optional(),
});

// Example usage
const match = {
  id: 1,
  homeTeam: "Team A",
  awayTeam: "Team B",
  homeTeamScore: 0,
  awayTeamScore: 0,
  status: "SCHEDULED",
  startTime: new Date(),
  endTime: null,
  createdAt: new Date(),
  sport: "FOOTBALL",
  commentaries: [
    {
      id: 1,
      matchId: 1,
      match: { id: 1 },
      minute: 10,
      sequence: 1,
      period: "FIRST_HALF",
      eventType: "GOAL",
      actor: "Player A",
      team: "Team A",
      message: "Goal scored by Player A",
      metadata: null,
      tags: [],
      createdAt: new Date(),
    },
  ],
};
const listMatchQueryValidation = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  status: z.enum(["SCHEDULED", "LIVE", "FINISHED", "CANCELLED"]).optional(),
  sport: z.enum(["FOOTBALL", "BASKETBALL", "TENNIS", "VOLLEYBALL"]).optional(),
});
const validationResult = MatchSchema.safeParse(match);

if (!validationResult.success) {
  console.log(validationResult.error);
} else {
  console.log("Validation successful");
}
export { match, MatchSchema, listMatchQueryValidation, CommentarySchema };
