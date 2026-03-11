import dotenv from "dotenv";
dotenv.config({ path: "backend/db/prisma/.env" });

import express from "express";
import matchRouter from "./routes/matches-route.js";
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Define a route
app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});
app.use("/matches", matchRouter);

// Start the server
const port = 8000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
