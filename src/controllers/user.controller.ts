import User from "../models/User";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  generateTempToken,
  validateTempToken,
} from "../services/twoFactor.service";
import emailService from "../services/email.service";
import { AuthRequest } from "../middleware/authMiddleware";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ active: true }).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Failed to fetch users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSingleUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({
      _id: req.user?.id,
      active: true,
    }).populate("lastUpdatedBy");
    if (user) {
      res.status(200).json(user);
      return;
    } else {
      res.status(400).json("User not found");
      return;
    }
  } catch (error) {
    console.error("❌ Failed to fetch single user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const phone = req.body.phone;
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res
        .status(400)
        .json({ error: "Email is already in use. Please try another." });
      return;
    }
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      res
        .status(400)
        .json({ error: "Phone number is already in use. Please try another." });
      return;
    }

    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error("❌ Failed to create user:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

//toggling 2 factor authentication
export const toggleTwoFactor = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  user.twoFactorEnabled = !user.twoFactorEnabled;
  await user.save();

  res.status(200).json({ twoFactorEnabled: user.twoFactorEnabled });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!changePassword || !newPassword) {
      res
        .status(404)
        .json({ error: "Both current and new password are required !" });
      return;
    }

    if (!req.user?.id) {
      res.status(401).json({
        error: "Unauthorized. Please log in to change Your Password.",
      });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ error: "Incorrect Current Password." });
      return;
    }
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { names, phone, email, role } = req.body;
    const updateUser = {
      names,
      phone,
      email,
      role,
      lastUpdatedBy: req.user?.id,
    };
    const user = await User.findByIdAndUpdate(req.params.id, updateUser, {
      new: true,
      runValidators: true,
    });

    if (user) {
      res.status(200).json(user);
    }
  } catch (error) {
    console.error("❌ Failed to update user:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const desactivateUser = async (req: AuthRequest, res: Response) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          active: false,
          desactivatedBy: req.user?.id,
        },
      },
      { new: true }
    );
    if (!updateUser)
      res.status(403).json({ error: "Not allowed or user not found" });
    res.status(200).json(updateUser);
  } catch (error) {
    console.error("❌ Failed to update camera:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const userAccess = async (req: AuthRequest, res: Response) => {
  const action = req.body.action;
  try {
    if (action == "block") {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            blocked: true,
            lastUpdatedBy: req.user?.id,
          },
        },
        { new: true }
      );
      if (!updateUser) {
        res.status(403).json({ error: "Not allowed or User not found" });
        return;
      }
    } else if (action == "unblock") {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            blocked: false,
            lastUpdatedBy: req.user?.id,
          },
        },
        { new: true }
      );
      if (!updateUser) {
        res.status(403).json({ error: "Not allowed or User not found" });
        return;
      }
    } else {
      res.status(403).json({ error: "Your Request can't be processed" });
    }
    res.status(200).json({ message: `${action} request handled successful` });
    return;
  } catch (error) {
    console.error("❌ Failed to update camera:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

const createToken = (user: any) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "supersecretkey",
    { expiresIn: "1h" }
  );
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const tempCode = generateTempToken(user);
    const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
    <h2 style="text-align: center; color: #333;">Smart Surveillance System Two-Factor Authentication Code</h2>
    <p style="font-size: 16px; color: #555; text-align: center;">
      Use the following code to complete your login:
    </p>
    <div style="font-size: 32px; font-weight: bold; color: #1a73e8; text-align: center; margin: 20px 0;">
      ${tempCode}
    </div>
    <p style="font-size: 14px; color: #999; text-align: center;">
      This code will expire in 5 minutes for your security.
    </p>
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
    <p style="font-size: 12px; color: #bbb; text-align: center;">
      If you did not request this code, please ignore this email.
    </p>
  </div>
`;

    // If 2FA is enabled, return tempToken instead of final token
    if (user.twoFactorEnabled) {
      emailService.sendEmail({
        to: user.email,
        subject: "Two Factor Authentication Code",
        html: html,
      });
      res.status(200).json({
        message: "2FA required",
        user,
        tempToken: tempCode,
      });
      return;
    }
    if (user.blocked) {
      res.status(403).json({
        message:
          "Your account has been blocked. Please contact Super Admin for more info!",
      });
      return;
    }
    const token = createToken(user);
    res.cookie("authToken", token, {
      httpOnly: true, // 🛑 Prevents JavaScript access (protects against XSS attacks)
      secure: process.env.NODE_ENV === "production", // 🛑 Secure cookies in production (HTTPS)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Login was successful", token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// POST /api/auth/login/google
export const loginWithGoogle = async (req: Request, res: Response) => {
  const { accessToken } = req.body;

  // Ideally you verify the token with Google
  // For now, simulate verified Google email
  const email = "google_user_verified@example.com"; // replace this with real verification logic

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Create user with Google login
      user = await User.create({
        email,
        names: "Google User",
        password: "", // not needed for Google login
        phone: "N/A",
        role: "NORMAL",
        hasGoogleAuth: true,
      });
    }

    const token = createToken(user);

    if (user.twoFactorEnabled) {
      res.status(200).json({
        message: "2FA required",
        user,
        tempToken: token,
      });
      return;
    }
    res.cookie("authToken", token, {
      httpOnly: true, // 🛑 Prevents JavaScript access (protects against XSS attacks)
      secure: process.env.NODE_ENV === "production", // 🛑 Secure cookies in production (HTTPS)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1 * 60 * 60 * 1000,
    });

    res.status(200).json({ user, token });
  } catch (err) {
    console.error("Google login failed", err);
    res.status(500).json({ message: "Google Login Failed" });
  }
};

// POST /api/auth/factor
export const verifyTwoFactor = async (req: Request, res: Response) => {
  const { tempToken } = req.body;

  try {
    const user = validateTempToken(tempToken);

    if (!user) {
      res.status(400).json({ message: "Invalid or expired 2FA code!" });
      return;
    }

    const token = createToken(user);
    res.cookie("authToken", token, {
      httpOnly: true, // 🛑 Prevents JavaScript access (protects against XSS attacks)
      secure: process.env.NODE_ENV === "production", // 🛑 Secure cookies in production (HTTPS)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1 * 60 * 60 * 1000,
    });
    res.status(200).json({ user, token });
    return;
  } catch (err) {
    console.error("2FA validation error:", err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res
      .status(200)
      .json({ message: "Logout successful. All cookies cleared!" });
  } catch (error) {
    console.error("❌ Error in logoutUser:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
