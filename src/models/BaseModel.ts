import { Schema } from "mongoose";

export const BaseModelFields = {
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  deletedAt: { type: Date },
  active: { type: Boolean, default: true },
};

export const BaseModelOptions = {
  timestamps: true,
};
