import { Router } from "express";
import validate from "../validators/validate";
import { ThreadSchema } from "../validators/threadValidator";
import Thread from "../models/Thread";
import mongoose from "mongoose";
import User from "../models/User";

const router = Router();

router.post("/", validate(ThreadSchema), async (req, res) => {
  const user = req.user;
  if (!user) return;
  const { content } = req.body;
  const newThread = await Thread.create({ content, user: req.user?.id });
  res.status(201).json(newThread.toObject());
});

router.get("/user/:username", async (req, res) => {
  const existingUser = await User.findOne({
    username: req.params.username,
  });
  if (!existingUser)
    return res.status(404).json({ error: "Cannot find that user" });

  const threads = await Thread.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(existingUser._id),
      },
    },
    {
      $lookup: {
        from: "threads", // assuming the comments are also stored in the same 'posts' collection
        localField: "comments",
        foreignField: "_id",
        as: "commentsDetails",
      },
    },
    {
      $project: {
        content: 1,
        user: 1,
        images: 1,
        createdAt: 1,
        likesCount: { $size: "$likes" },
        reThreadsCount: { $size: "$reThreads" },
        commentsCount: { $size: "$comments" },
        comments: "$commentsDetails",
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);
  if (threads.length === 0)
    res
      .status(404)
      .json({ error: "Requested thread cannot be found on the server." });

  res.status(201).json(threads);
});

router.post("/:id/thread", validate(ThreadSchema), async (req, res) => {
  const user = req.user;
  if (!user) return;

  const existingThread = await Thread.findById(req.params.id);
  if (!existingThread)
    return res.status(400).json({ error: "The parent thread doesn't exist" });

  const { content } = req.body;
  const newThread = await Thread.create({ content, user: req.user?.id });
  await Thread.findByIdAndUpdate(req.params.id, {
    $push: {
      comments: newThread._id,
    },
  });
  res.status(201).json(newThread.toObject());
});

router.get("/:id", async (req, res) => {
  const thread = await Thread.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.params.id),
      },
    },
    {
      $lookup: {
        from: "threads", // assuming the comments are also stored in the same 'posts' collection
        localField: "comments",
        foreignField: "_id",
        as: "commentsDetails",
      },
    },
    {
      $project: {
        content: 1,
        user: 1,
        images: 1,
        createdAt: 1,
        likesCount: { $size: "$likes" },
        reThreadsCount: { $size: "$reThreads" },
        commentsCount: { $size: "$comments" },
        comments: "$commentsDetails",
      },
    },
  ]);
  if (thread.length === 0)
    res
      .status(404)
      .json({ error: "Requested thread cannot be found on the server." });

  res.status(201).json(thread[0]);
});

export default router;
