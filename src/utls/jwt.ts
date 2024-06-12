// src/utils/jwt.ts

import jwt, { JwtPayload } from "jsonwebtoken";

interface TokenPayload extends JwtPayload {
  userId: number;
}

const secretKey = process.env.JWT_SECRET || "your_secret_key";

export const generateToken = (userId: string) => {
  const accessToken = jwt.sign({ userId }, secretKey, { expiresIn: "1d" });
  return {
    access: accessToken,
    refresh: jwt.sign({ accessToken }, secretKey, { expiresIn: "15d" }),
  };
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, secretKey) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid token");
  }
};
