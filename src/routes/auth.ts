import { Router } from "express";
import { loginSchema, userSchema } from "../validators/userValidator";

import bcrypt from "bcryptjs";
import { generateToken } from "../utls/jwt";
import authMiddleware from "../middleware/auth";
import User, { IUser } from "../models/User";
import dbConnect from "../db";
import validateUser from "../validators/validate";
import { generateProfilePictureUrl } from "../utls/profileImage";

const router = Router();

router.post("/register/", validateUser(userSchema), async (req, res) => {
  const { email, password, username, fullName, bio } = req.body;

  await dbConnect();

  const existingUser = await User.findOne({
    $or: [{ email: email }, { username: username }],
  });
  if (existingUser)
    return res
      .status(400)
      .json({ error: "User already exists with email or username." });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePicture = generateProfilePictureUrl(fullName);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      username,
      fullName,
      profilePicture,
      bio: bio ?? "",
    });

    const userWithoutPassword: any = newUser.toObject();
    delete userWithoutPassword.password;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the user" });
  }
});

router.post("/login/", validateUser(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  await dbConnect();
  try {
    const user: IUser | null = await User.findOne({
      $or: [{ email: email }],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id.toString());
    return res.status(200).json(token);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred during login" });
  }
});

router.get("/user/", authMiddleware, (req, res) => {
  res.json(req.user);
});

export default router;
