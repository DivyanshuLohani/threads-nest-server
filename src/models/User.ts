import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  fullName: string;
  bio?: string;
  profilePicture?: string;
  posts: Types.ObjectId[];
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: null,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
