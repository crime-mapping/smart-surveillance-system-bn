import crypto from "crypto";
import { IUser } from "../models/User";

interface TempToken {
  user: IUser;
  expiresAt: number;
}

const tempTokens = new Map<string, TempToken>();

const generateCode = (): string => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

export const generateTempToken = (user: IUser): string => {
  const code = generateCode();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  tempTokens.set(code, { user, expiresAt });

  // Optional auto-cleanup after expiration
  setTimeout(() => {
    tempTokens.delete(code);
  }, 5 * 60 * 1000);

  return code;
};

export const validateTempToken = (code: string): IUser | null => {
  const token = tempTokens.get(code);
  if (!token) return null;
  if (Date.now() > token.expiresAt) {
    tempTokens.delete(code);
    return null;
  }
  tempTokens.delete(code); // One-time use
  return token.user;
};
