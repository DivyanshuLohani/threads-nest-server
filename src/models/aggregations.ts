const threadAggreation = [
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
    },
  },
  {
    $unwind: "$user",
  },
  {
    $lookup: {
      from: "users",
      localField: "user.followers",
      foreignField: "_id",
      as: "followersList",
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "user.following",
      foreignField: "_id",
      as: "followingList",
    },
  },
  {
    $addFields: {
      "user.followersCount": { $size: "$followersList" },
      "user.followingCount": { $size: "$followingList" },
      likesCount: { $size: "$likes" },
      reThreadsCount: { $size: "$reThreads" },
    },
  },
  {
    $project: {
      content: 1,
      images: 1,
      createdAt: 1,
      "user.username": 1,
      "user.fullName": 1,
      "user.bio": 1,
      "user.profilePicture": 1,
      "user.followersCount": 1,
      "user.followingCount": 1,
      likesCount: 1,
      reThreadsCount: 1,
    },
  },
];

export { threadAggreation };
