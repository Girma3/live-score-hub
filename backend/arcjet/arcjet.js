import dotenv from "dotenv";
dotenv.config({ path: "/backend/db/prisma/.env" });
import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode =
  process.env.ARCJET_ENV === "development" ? "DRY_RUN" : "LIVE";
if (!arcjetKey) {
  throw new Error("Arcjet key is not defined in the environment variables.");
}

const httpArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),
        slidingWindow({ mode: arcjetMode, interval: "10s", max: 50 }),
      ],
    })
  : null;
const wsArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      mode: arcjetMode,
      rules: [
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),
        slidingWindow({ mode: arcjetMode, interval: "2s", max: 5 }),
      ],
    })
  : null;

function securityMiddleware() {
  return async (req, res, next) => {
    if (!httpArcjet) return next();

    try {
      const decision = await httpArcjet.protect(req);
      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({ error: "Too many requests!" });
        } else if (decision.reason.isBot()) {
          return res.status(403).json({ error: "Blocked by Arcjet for bot!" });
        } else {
          return res.status(403).json({ error: "Blocked by Arcjet!" });
        }
      }
    } catch (e) {
      console.error("arcjet middleware error", e);
      return res.status(503).json({ error: "Service unavailable" });
    }

    next();
  };
}

export { httpArcjet, wsArcjet, securityMiddleware };
