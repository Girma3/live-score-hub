import { Router } from "express";
import { createNewMatch, getMatches } from "../controllers/match-controller.js";

const matchRouter = Router();

matchRouter.get("/", getMatches);
matchRouter.post("/new", createNewMatch);
export default matchRouter;
