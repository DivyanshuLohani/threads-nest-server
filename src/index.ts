import express, { Request, Response } from "express";
import auth from "./routes/auth";
import threads from "./routes/threads";
import userRouter from "./routes/user";

import { configDotenv } from "dotenv";
import authMiddleware from "./middleware/auth";
import User from "./models/User";

configDotenv();

const app = express();
const PORT = 8000;

app.use(express.json());

app.use("*", (req, res, next) => {
  console.log(
    `[${Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date())}] ${res.statusCode} [${req.method}] - ${req.path}`
  );
  next();
});

app.use("/auth/", auth);
app.use("/threads/", authMiddleware, threads);
app.use("/users/", authMiddleware, userRouter);
// Route for getting available username
app.get("/u/:username", async (req, res) => {
  const existingUser = await User.findOne({
    username: req.params.username,
  });
  if (existingUser) return res.status(409).json({ error: "Not available" });
  return res.status(200).json({ message: "available" });
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
