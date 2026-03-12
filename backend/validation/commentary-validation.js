import { z } from "zod";

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
const commentaryValidation = CommentarySchema.omit({
  id: true,
  createdAt: true,
  match: true, // you don’t want clients to inject nested match objects
  matchId: true,
});
const commentaryQueryValidation = z.object({
  limit: z.coerce.number().int().positive().max(50).default(10),
  period: z
    .enum(["FIRST_HALF", "SECOND_HALF", "EXTRA_TIME", "PENALTIES"])
    .optional(),
  eventType: z.enum(["GOAL", "FOUL", "SUBSTITUTION", "GENERAL"]).optional(),
});

export { CommentarySchema, commentaryValidation, commentaryQueryValidation };
