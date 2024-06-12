import mongoose, { Document, Schema, Model, Types } from "mongoose";

interface IThread extends Document {
  content: string;
  user: Types.ObjectId;
  images?: string[];
  likes: Types.ObjectId[];
  reThreads: Types.ObjectId[];
  comments: Types.ObjectId[];
  createdAt: Date;
}

const ThreadSchema: Schema<IThread> = new Schema<IThread>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images: [
      {
        type: String,
        required: false,
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reThreads: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Thread",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Thread: Model<IThread> =
  mongoose.models.Thread || mongoose.model<IThread>("Thread", ThreadSchema);

export default Thread;
