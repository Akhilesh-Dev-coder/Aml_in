import mongoose from "mongoose";

const FALLBACK_MONGODB_URI =
  "mongodb+srv://dravion456_db_user:98DnmK1AluBj6E8B@cluster0.2ghwqaj.mongodb.net/aml_portfolio?retryWrites=true&w=majority";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const rawUri = process.env.MONGODB_URI || FALLBACK_MONGODB_URI;

  if (!rawUri) {
    return null;
  }

  // Strip accidental quotes that might be pasted in hosting environment dashboards
  const uri = rawUri.trim().replace(/^["']|["']$/g, "");

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      dbName: process.env.MONGODB_DB || "aml_portfolio",
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB connection error:", e);
    return null;
  }
}
