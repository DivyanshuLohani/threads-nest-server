import { Router } from "express";
import User from "../models/User";
import { Types } from "mongoose";
import Notification from "../models/Notification";
import validate from "../validators/validate";
import { userUpdate } from "../validators/userValidator";

const router = Router();

router.put("/:username/follow", async (req, res) => {
  const user = req.user;
  if (!user) return;

  const other = await User.findOne({
    username: req.params.username,
  });
  if (!other || other === null)
    return res.status(404).json({ error: "Cannot find that user." });

  const isAlreadyFollowing = other.followers.includes(
    new Types.ObjectId(user._id)
  );
  if (isAlreadyFollowing) {
    return res
      .status(400)
      .json({ message: "You are already following this user" });
  }

  // Follow the user and update followers list
  await User.findByIdAndUpdate(other._id, {
    $push: { followers: new Types.ObjectId(user._id) },
  });
  await User.findByIdAndUpdate(user._id, {
    $push: { following: new Types.ObjectId(other._id) },
  });

  const notification = new Notification({
    user: new Types.ObjectId(other._id),
    target: new Types.ObjectId(user._id),
    read: false,
    event: "follow",
  });
  await notification.save();

  res.status(200).json({ message: "User followed successfully" });
});

router.delete("/:username/follow", async (req, res) => {
  const user = req.user;
  if (!user) return;

  const other = await User.findOne({
    username: req.params.username,
  });
  if (!other || other === null)
    return res.status(404).json({ error: "Cannot find that user." });

  const isAlreadyFollowing = other.followers.includes(
    new Types.ObjectId(user._id)
  );
  if (!isAlreadyFollowing) {
    return res.status(400).json({ message: "You do not follow this user." });
  }

  // Follow the user and update followers list
  await User.findByIdAndUpdate(other._id, {
    $pull: { followers: new Types.ObjectId(user._id) },
  });
  await User.findByIdAndUpdate(user._id, {
    $pull: { following: new Types.ObjectId(other._id) },
  });

  res.status(200).json({ message: "User unfollowed successfully" });
});

router.patch("/update/", validate(userUpdate), async (req, res) => {
  const user = req.user;
  if (!user) return;
  const { fullName, username, bio } = req.body;

  const existingUser = await User.findOne({
    username,
  });
  if (existingUser)
    return res.status(409).json({ error: "Username not available" });

  const updatedUser = await User.findByIdAndUpdate(user._id, {
    fullName,
    username,
    bio,
  });
  const updatedUserNoPass: any = updatedUser?.toObject();
  delete updatedUserNoPass?.password;

  res.status(200).json(updatedUserNoPass);
});

export default router;
