import dotenv from "dotenv";
dotenv.config({ path: "backend/db/prisma/.env" });
import http from "http";
import express from "express";
import matchRouter from "./routes/matches-route.js";
import { attachWebSocketServer } from "./ws/server.js";

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
const server = http.createServer(app);
// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Define a route
app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});
app.use("/matches", matchRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost/${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running on ${baseUrl}`);
  console.log(`websocket running on ${baseUrl.replace("http", "ws")}/ws`);
});
