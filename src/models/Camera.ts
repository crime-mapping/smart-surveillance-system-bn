import mongoose, { Schema, Document } from "mongoose";
import { BaseModelFields, BaseModelOptions } from "./BaseModel";

export interface ICamera extends Document {
  name: string;
  description?: string;
  streamUrl: string;
  isConnected: boolean;
  location: mongoose.Schema.Types.ObjectId;
  recordedBy: mongoose.Schema.Types.ObjectId;
}

const CameraSchema = new Schema<ICamera>(
  {
    name: { type: String, required: true },
    description: { type: String },
    streamUrl: { type: String, required: true },
    isConnected: { type: Boolean, default: true },
    location: {
      type: Schema.Types.ObjectId,
      ref: "SupervisedLocation",
      required: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ...BaseModelFields,
  },
  BaseModelOptions
);

export default mongoose.model<ICamera>("Camera", CameraSchema);
