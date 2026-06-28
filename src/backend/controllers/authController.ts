import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UserRepository, IUser } from "../models/User.ts";
import { JWTHelper } from "../utils/jwtHelper.ts";
import { IAuthRequest } from "../middleware/authMiddleware.ts";

export class AuthController {
  /**
   * POST /api/auth/register
   * Registers a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body;

      // 1. Check if user already exists
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: "Email already registered. Please log in instead.",
          code: "AUTH_EMAIL_EXISTS",
        });
        return;
      }

      // 2. Hash password with bcrypt (12 rounds)
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 3. Create user
      const user = await UserRepository.create({
        name,
        email,
        password: hashedPassword,
        role: role || "user",
      });

      // 4. Generate JWT
      const token = JWTHelper.generateToken({
        id: user.id || user._id!.toString(),
        email: user.email,
        role: user.role,
      });

      // 5. Configure secure, httpOnly cookie settings
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      };

      // Set cookie
      res.cookie("token", token, cookieOptions);

      // 6. Return response
      res.status(201).json({
        success: true,
        message: "Registration successful! Welcome aboard.",
        token,
        user: {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Registration Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error during registration.",
        code: "SERVER_ERROR",
      });
    }
  }

  /**
   * POST /api/auth/login
   * Authenticates a user and issues a token
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // 1. Find user by email
      const user = await UserRepository.findByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          error: "Invalid email or password.",
          code: "AUTH_INVALID_CREDENTIALS",
        });
        return;
      }

      // 2. Compare passwords
      const isMatch = await bcrypt.compare(password, user.password!);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          error: "Invalid email or password.",
          code: "AUTH_INVALID_CREDENTIALS",
        });
        return;
      }

      // 3. Generate JWT
      const token = JWTHelper.generateToken({
        id: user.id || user._id!.toString(),
        email: user.email,
        role: user.role,
      });

      // 4. Set cookie options
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      };

      // Set cookie
      res.cookie("token", token, cookieOptions);

      // 5. Return success
      res.status(200).json({
        success: true,
        message: "Login successful. Welcome back!",
        token,
        user: {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error during login.",
        code: "SERVER_ERROR",
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Clears authentication session
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({
        success: true,
        message: "Logged out successfully. See you soon!",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error during logout.",
        code: "SERVER_ERROR",
      });
    }
  }

  /**
   * GET /api/auth/profile
   * Returns current user information
   */
  static async getProfile(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Unauthorized user.",
          code: "AUTH_UNAUTHORIZED",
        });
        return;
      }

      res.status(200).json({
        success: true,
        user: req.user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error while fetching profile.",
        code: "SERVER_ERROR",
      });
    }
  }

  /**
   * GET /api/auth/users
   * Returns list of all registered users (passwords stripped)
   */
  static async getAllUsers(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Unauthorized user.",
          code: "AUTH_UNAUTHORIZED",
        });
        return;
      }

      const users = await UserRepository.findAll();
      const sanitizedUsers = users.map((u) => ({
        id: u.id || u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      }));

      res.status(200).json({
        success: true,
        users: sanitizedUsers,
      });
    } catch (error) {
      console.error("Fetch Users Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while fetching users list.",
        code: "SERVER_ERROR",
      });
    }
  }
}
