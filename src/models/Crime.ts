import mongoose, { Schema, Document } from "mongoose";
import { BaseModelFields, BaseModelOptions } from "./BaseModel";

export enum EmergencyLevel {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum CrimeType {
  ABUSE = "ABUSE",
  ARREST = "ARREST",
  ARSON = "ARSON",
  ASSAULT = "ASSAULT",
  BURGLARY = "BURGLARY",
  EXPLOSION = "EXPLOSION",
  FIGHTING = "FIGHTING",
  ROAD_ACCIDENTS = "ROAD_ACCIDENTS",
  ROBBERY = "ROBBERY",
  SHOOTING = "SHOOTING",
  SHOPLIFTING = "SHOPLIFTING",
  STEALING = "STEALING",
  VANDALISM = "VANDALISM",
}

export interface ICrime extends Document {
  crimeDescription?: string;
  crimeType: CrimeType;
  crimeLocation: string;
  dateOfOccurrence: Date;
  emergencyLevel: EmergencyLevel;
  supportingImage?: string;
}

const CrimeSchema = new Schema<ICrime>(
  {
    crimeDescription: { type: String },
    crimeType: { type: String, enum: Object.values(CrimeType), required: true },
    crimeLocation: { type: String, required: true },
    dateOfOccurrence: { type: Date, required: true },
    emergencyLevel: {
      type: String,
      enum: Object.values(EmergencyLevel),
      required: true,
    },
    supportingImage: { type: String },
    ...BaseModelFields,
  },
  BaseModelOptions
);

export default mongoose.model<ICrime>("Crime", CrimeSchema);
