import { Router } from "express";
import User from "../models/User";
import { Types } from "mongoose";
import Notification from "../models/Notification";
import validate from "../validators/validate";
import { userUpdate } from "../validators/userValidator";
import { v2 as cloudinary } from "cloudinary";

const router = Router();

router.get("/notifications", async (req, res) => {
  const user = req.user;
  if (!user) return;

  const notifications = await Notification.aggregate([
    {
      $match: {
        user: req.user?._id,
        read: false,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
    },
    {
      $lookup: {
        from: "users",
        localField: "target",
        foreignField: "_id",
        as: "targetDetails",
      },
    },
    {
      $unwind: "$targetDetails",
    },
    {
      $addFields: {
        "userDetails.followersCount": { $size: "$userDetails.followers" },
        "userDetails.followingCount": { $size: "$userDetails.following" },
        "userDetails.followed": {
          $cond: {
            if: {
              $in: [
                new Types.ObjectId(req.user?._id),
                "$userDetails.followers",
              ],
            },
            then: true,
            else: false,
          },
        },
        "targetDetails.followersCount": { $size: "$targetDetails.followers" },
        "targetDetails.followingCount": { $size: "$targetDetails.following" },
        "targetDetails.followed": {
          $cond: {
            if: {
              $in: [
                new Types.ObjectId(req.user?._id),
                "$targetDetails.followers",
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        createdAt: 1,
        event: 1,
        userDetails: {
          createdAt: 1,
          username: 1,
          fullName: 1,
          bio: 1,
          profilePicture: 1,
          followersCount: 1,
          followingCount: 1,
          followed: 1,
        },
        targetDetails: {
          createdAt: 1,
          username: 1,
          fullName: 1,
          bio: 1,
          profilePicture: 1,
          followersCount: 1,
          followingCount: 1,
          followed: 1,
        },
      },
    },
  ]);
  // if (notifications && notifications.length > 0)
  //   notifications.forEach(async (e) => {
  //     if (e) {
  //       e.read = true;
  //       await e.save();
  //     }
  //   });

  res.json(notifications);
});

router.get("/:username", async (req, res) => {
  const user = req.user;
  if (!user) return;

  const other = await User.aggregate([
    { $match: { username: req.params.username } },
    {
      $addFields: {
        followersCount: { $size: "$followers" },
        followingCount: { $size: "$following" },
      },
    },
    {
      $project: {
        createdAt: 1,
        username: 1,
        fullName: 1,
        bio: 1,
        profilePicture: 1,
        followersCount: 1,
        followingCount: 1,
        followed: {
          $cond: {
            if: { $in: [new Types.ObjectId(req.user?._id), "$followers"] },
            then: true,
            else: false,
          },
        },
      },
    },
  ]).limit(1);
  if (!other || other.length === 0)
    return res.status(404).json({ error: "Cannot find that user." });

  res.status(200).json(other[0]);
});
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
  let { fullName, username, bio, profilePicture } = req.body;

  if (username !== user.username) {
    const existingUser = await User.findOne({
      username,
    });
    if (existingUser)
      return res.status(409).json({ error: "Username not available" });
  }

  if (profilePicture !== user.profilePicture) {
    const uploadResult = await cloudinary.uploader.upload(profilePicture);
    profilePicture = uploadResult.secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(user._id, {
    fullName,
    username,
    bio,
    profilePicture,
  });
  const updatedUserNoPass: any = updatedUser?.toObject();
  delete updatedUserNoPass?.password;

  res.status(200).json(updatedUserNoPass);
});

export default router;
