import mongoose, { Schema, Document } from "mongoose";
import { BaseModelFields, BaseModelOptions } from "./BaseModel";

export interface ISupervisedLocation extends Document {
  location: string;
  description: string;
  cameras: mongoose.Schema.Types.ObjectId[];
  recordedBy: mongoose.Schema.Types.ObjectId;
}

const SupervisedLocationSchema = new Schema<ISupervisedLocation>(
  {
    location: { type: String, required: true },
    description: { type: String },
    cameras: [{ type: Schema.Types.ObjectId, ref: "Camera" }],
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ...BaseModelFields,
  },
  BaseModelOptions
);

export default mongoose.model<ISupervisedLocation>(
  "SupervisedLocation",
  SupervisedLocationSchema
);
