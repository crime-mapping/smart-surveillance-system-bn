// models/NotificationStatus.ts
import mongoose, { Schema, Document } from "mongoose";

export interface INotificationStatus extends Document {
  user: mongoose.Types.ObjectId;
  notification: mongoose.Types.ObjectId;
  isRead: boolean;
}

const NotificationStatusSchema = new Schema<INotificationStatus>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notification: {
      type: Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationStatusSchema.index({ user: 1, notification: 1 }, { unique: true });

export default mongoose.model<INotificationStatus>(
  "NotificationStatus",
  NotificationStatusSchema
);
