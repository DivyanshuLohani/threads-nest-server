import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    // console.log("Database is connected already");
    return;
  }

  if (!process.env.DATABASE_URL)
    return console.error("DATABASE_URL is not set.");

  try {
    const db = await mongoose.connect(process.env.DATABASE_URL || "");
    connection.isConnected = db.connections[0].readyState;

    console.log("Connection Successful to database");
  } catch (error) {
    console.log("Cannot connect to the database", error);
    process.exit();
  }
}

export default dbConnect;
