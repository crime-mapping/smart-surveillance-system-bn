import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { BaseModelFields, BaseModelOptions } from "./BaseModel";

export enum Role {
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
}

export interface IUser extends Document {
  names: string;
  phone: string;
  email: string;
  role: Role;
  notificationEnabled: boolean;
  password: string;
  twoFactorEnabled: boolean;
  hasGoogleAuth: boolean;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    names: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), default: Role.ADMIN },
    notificationEnabled: { type: Boolean, default: true },
    password: { type: String, required: true },
    twoFactorEnabled: { type: Boolean, default: false },
    hasGoogleAuth: { type: Boolean, default: false },
    ...BaseModelFields,
  },
  BaseModelOptions
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
