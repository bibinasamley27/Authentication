import { Response, NextFunction } from "express";
import { IAuthRequest } from "./authMiddleware.ts";

export const authorizeRoles = (permittedRoles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Unauthorized: User credentials not verified.",
          code: "AUTH_UNAUTHORIZED",
        });
        return;
      }

      if (!permittedRoles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: `Forbidden: Access restricted to [${permittedRoles.join(", ")}] users. Your role: ${req.user.role}`,
          code: "AUTH_FORBIDDEN",
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error during authorization.",
        code: "AUTH_SERVER_ERROR",
      });
    }
  };
};
