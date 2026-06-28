import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "MERN_SECURE_AUTH_SUPER_SECRET_KEY_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export interface ITokenPayload {
  id: string;
  email: string;
  role: "user" | "admin";
}

export class JWTHelper {
  /**
   * Generates a signed JWT with user information
   */
  static generateToken(payload: ITokenPayload): string {
    return jwt.sign(payload as any, JWT_SECRET as any, {
      expiresIn: JWT_EXPIRES_IN as any,
    } as any) as any;
  }

  /**
   * Verifies a JWT token and returns decoded payload
   */
  static verifyToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as ITokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("TokenExpired");
      }
      throw new Error("TokenInvalid");
    }
  }
}
