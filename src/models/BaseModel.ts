import mongoose, { Schema } from "mongoose";

export const BaseModelFields = {
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  deletedAt: { type: Date },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  desactivatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  active: { type: Boolean, default: true },
};

export const BaseModelOptions = {
  timestamps: true,
};
