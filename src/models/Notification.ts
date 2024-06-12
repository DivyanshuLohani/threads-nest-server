import mongoose, { Schema, Document, Types } from "mongoose";

type EventType = "like" | "follow" | "post";

// Here target is the user who triggered the notification means that
// Who sent a follow or who liked a post
interface INotification extends Document {
  user: Types.ObjectId;
  target?: Types.ObjectId;
  event: EventType;
  read: boolean;
  createdAt: Date;
}

// Define schema for Notification
const notificationSchema: Schema<INotification> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  target: { type: Schema.Types.ObjectId, ref: "User", default: null },
  event: { type: String, enum: ["like", "follow", "post"], required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
