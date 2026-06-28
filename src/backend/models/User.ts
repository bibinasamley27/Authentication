import mongoose, { Schema, Document } from "mongoose";
import { LocalDB } from "../config/db.ts";

export interface IUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends Document, Omit<IUser, "id" | "_id"> {
  _id: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

// Prevent mongoose model compilation errors on server restarts
export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

// Repository layer to support both live MongoDB and the preview LocalDB fallback
export class UserRepository {
  private static useMongo(): boolean {
    return !!process.env.MONGODB_URI;
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (this.useMongo()) {
      const user = await (UserModel as any).findOne({ email: cleanEmail });
      return user ? user.toObject() : null;
    } else {
      const db = LocalDB.read();
      const user = db.users.find((u) => u.email === cleanEmail);
      return user ? { ...user } : null;
    }
  }

  static async findById(id: string): Promise<IUser | null> {
    if (this.useMongo()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const user = await (UserModel as any).findById(id);
      return user ? user.toObject() : null;
    } else {
      const db = LocalDB.read();
      const user = db.users.find((u) => u.id === id);
      return user ? { ...user } : null;
    }
  }

  static async create(userData: IUser): Promise<IUser> {
    const cleanUserData = {
      ...userData,
      email: userData.email.toLowerCase().trim(),
    };

    if (this.useMongo()) {
      const newUser = new (UserModel as any)(cleanUserData);
      const savedUser = await newUser.save();
      return savedUser.toObject();
    } else {
      const db = LocalDB.read();
      const newUser: IUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: cleanUserData.name,
        email: cleanUserData.email,
        password: cleanUserData.password,
        role: cleanUserData.role || "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.users.push(newUser);
      LocalDB.write(db);
      return newUser;
    }
  }

  static async findAll(): Promise<IUser[]> {
    if (this.useMongo()) {
      const users = await (UserModel as any).find({});
      return users.map((u: any) => u.toObject());
    } else {
      const db = LocalDB.read();
      return db.users.map((u) => ({ ...u }));
    }
  }
}
