import { MATCH_STATUS } from "../validation/match-validation.js";

async function getMatchStatus(startTime, endTime, now = new Date()) {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : null;

  if (now < start) {
    return MATCH_STATUS.SCHEDULED;
  }

  if (end && now > end) {
    return MATCH_STATUS.FINISHED;
  }

  return MATCH_STATUS.LIVE;
}

async function syncMatchStatus(match, updateStatus) {
  const nextStatus = await getMatchStatus(match.startTime, match.endTime);
  if (!nextStatus) {
    return match.status;
  }
  if (match.status !== nextStatus) {
    await updateStatus(match.id, nextStatus);
    match.status = nextStatus; // Update the match object with the new status
  }
  return match.status;
}
export { getMatchStatus, syncMatchStatus };
