// src/middleware/auth.ts

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utls/jwt";
import User from "../models/User";
import dbConnect from "../db";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  await dbConnect();
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) throw Error("Cannot find user");
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default authMiddleware;
