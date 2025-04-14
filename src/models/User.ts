import mongoose, { Schema, Document } from "mongoose";
import { BaseModelFields, BaseModelOptions } from "./BaseModel";

export enum Role {
  ADMIN = "ADMIN",
  NORMAL = "NORMAL",
}

export interface IUser extends Document {
  names: string;
  phone: string;
  email: string;
  role: Role;
  hasSyncedWithAI: boolean;
  notificationEnabled: boolean;
  password: string;
  cameras: mongoose.Schema.Types.ObjectId[];
  hasPremiumAccess: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    names: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), default: Role.NORMAL },
    hasSyncedWithAI: { type: Boolean, default: false },
    notificationEnabled: { type: Boolean, default: true },
    password: { type: String, required: true },
    cameras: [{ type: Schema.Types.ObjectId, ref: "Camera" }],
    hasPremiumAccess: { type: Boolean, default: false },
    ...BaseModelFields,
  },
  BaseModelOptions
);

export default mongoose.model<IUser>("User", UserSchema);
