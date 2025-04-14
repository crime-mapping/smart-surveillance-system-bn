import mongoose, { Schema, Document } from "mongoose";
import { BaseModelFields, BaseModelOptions } from "./BaseModel";

export interface INotification extends Document {
  title: string;
  description: string;
  timestamp: Date;
  user: mongoose.Schema.Types.ObjectId;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ...BaseModelFields,
  },
  BaseModelOptions
);

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
