import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const DB_FILE_PATH = path.join(process.cwd(), "src", "backend", "data", "db.json");

// Ensure the data directory exists
const dir = path.dirname(DB_FILE_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Initial structure for local JSON database
if (!fs.existsSync(DB_FILE_PATH)) {
  fs.writeFileSync(
    DB_FILE_PATH,
    JSON.stringify({ users: [], tasks: [] }, null, 2),
    "utf-8"
  );
}

export interface IDBData {
  users: any[];
  tasks: any[];
}

export class LocalDB {
  static read(): IDBData {
    try {
      const data = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return { users: [], tasks: [] };
    }
  }

  static write(data: IDBData): void {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  }
}

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;

  if (mongoURI) {
    try {
      await mongoose.connect(mongoURI);
      console.log("🟢 Connected to live MongoDB Database via Mongoose.");
      return true;
    } catch (error) {
      console.error("🔴 MongoDB connection failed:", error);
      console.log("🟡 Falling back to Local File-Based Database for preview.");
      return false;
    }
  } else {
    console.log("🟡 MONGODB_URI not found. Running in local JSON-file mode for instant sandbox preview.");
    return false;
  }
}
