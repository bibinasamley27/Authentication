import { Response, NextFunction } from "express";
import { Request as ExpressRequest } from "express";
import { JWTHelper } from "../utils/jwtHelper.ts";
import { UserRepository, IUser } from "../models/User.ts";

export interface IAuthRequest extends ExpressRequest {
  user?: IUser;
}

export const authenticateJWT = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = "";

    // 1. Check for token in cookies (httpOnly)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    // 2. Check for token in Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: "Access Denied: No authentication token provided.",
        code: "AUTH_TOKEN_MISSING",
      });
      return;
    }

    try {
      const decoded = JWTHelper.verifyToken(token);

      // Verify user still exists in database
      const user = await UserRepository.findById(decoded.id);
      if (!user) {
        res.status(401).json({
          success: false,
          error: "Access Denied: The user belonging to this token no longer exists.",
          code: "AUTH_USER_NOT_FOUND",
        });
        return;
      }

      // Remove password from attached user object for security
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
      next();
    } catch (tokenError: any) {
      if (tokenError.message === "TokenExpired") {
        res.status(401).json({
          success: false,
          error: "Session expired. Please log in again.",
          code: "AUTH_TOKEN_EXPIRED",
        });
        return;
      }
      res.status(401).json({
        success: false,
        error: "Invalid token. Authentication failed.",
        code: "AUTH_TOKEN_INVALID",
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal server error during authentication.",
      code: "AUTH_SERVER_ERROR",
    });
  }
};
