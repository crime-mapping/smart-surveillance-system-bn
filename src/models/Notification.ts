// models/Notification.ts
import mongoose, { Schema, Document, Types } from "mongoose";
import { BaseModelFields, BaseModelOptions } from "./BaseModel";

export interface INotification extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  timestamp: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    ...BaseModelFields,
  },
  BaseModelOptions
);

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
