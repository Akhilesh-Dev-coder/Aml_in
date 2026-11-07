import mongoose from "mongoose";

const FALLBACK_MONGODB_URI =
  "mongodb+srv://dravion456_db_user:98DnmK1AluBj6E8B@cluster0.2ghwqaj.mongodb.net/aml_portfolio?retryWrites=true&w=majority";

export let lastMongoError: string | null = null;

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
  // If already connected and socket is active, return immediately
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    lastMongoError = null;
    return mongoose;
  }

  const rawUri = process.env.MONGODB_URI || FALLBACK_MONGODB_URI;

  if (!rawUri) {
    lastMongoError = "MONGODB_URI environment variable is missing";
    return null;
  }

  // Strip accidental quotes pasted into hosting dashboard env vars
  const uri = rawUri.trim().replace(/^["']|["']$/g, "");

  // If connection is in progress, wait for it
  if (mongoose.connection && (mongoose.connection.readyState as number) === 2 && cached.promise) {
    try {
      await cached.promise;
      if ((mongoose.connection.readyState as number) === 1) {
        lastMongoError = null;
        return mongoose;
      }
    } catch (e: any) {
      cached.promise = null;
      lastMongoError = e?.message || String(e);
    }
  }

  try {
    cached.promise = mongoose.connect(uri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4, // Force IPv4 to avoid cloud server DNS IPv6 stalls
      dbName: process.env.MONGODB_DB || "aml_portfolio",
    });

    cached.conn = await cached.promise;
    lastMongoError = null;
    return cached.conn;
  } catch (error: any) {
    cached.promise = null;
    cached.conn = null;
    lastMongoError = error?.message || String(error);
    console.error("MongoDB Atlas connection error:", lastMongoError);
    return null;
  }
}
