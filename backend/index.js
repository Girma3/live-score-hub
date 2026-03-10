import dotenv from "dotenv";
dotenv.config({ path: "backend/db/prisma/.env" });
console.log("DATABASE_URL:", process.env.DATABASE_URL);
import express from "express";
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Define a route
app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

// Start the server
const port = 8000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
