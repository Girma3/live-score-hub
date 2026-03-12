import { Router } from "express";
import {
  newCommentary,
  getCommentaryFeed,
} from "../controllers/commentary-controller.js";

const commentaryRouter = Router({ mergeParams: true });

commentaryRouter.get("/", getCommentaryFeed);
commentaryRouter.post("/", newCommentary);

export default commentaryRouter;
