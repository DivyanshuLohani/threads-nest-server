import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

// Define the schema for user registration
const userSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" }),
  fullName: z.string().min(1),
  bio: z.string().max(512).optional(),
});

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

const userUpdate = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  bio: z.string().optional(),
});

export { userSchema, loginSchema, userUpdate };
