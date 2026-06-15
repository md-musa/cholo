import { Server as SocketIOServer } from "socket.io";
import { Server as ExpressServer } from "http";
import app, { socketHandler } from "./app";
import mongoose from "mongoose";
import config from "./config";
import { logger } from "./shared/logger";
<<<<<<< HEAD
import dotenv from "dotenv";

dotenv.config();
=======

>>>>>>> 4b24f452528cf3493d8ff4bcd08834eb06067722
export let expressServer: ExpressServer;
export let io: SocketIOServer;

const port = process.env.PORT || 4000;

const main = async () => {
  try {
    await mongoose.connect(config.DATABASE_URL as string);
    console.log("✅ Database connected successfully");

    // Start Express server
    console.log("Using port:", port);
    expressServer = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    // Initialize Socket.IO
    io = new SocketIOServer(expressServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });


    io.on("connection", socketHandler);

  } catch (error) {
<<<<<<< HEAD
    console.log(error?.message || "Unknown error");
=======
>>>>>>> 4b24f452528cf3493d8ff4bcd08834eb06067722
    console.log("❌ Database connection failed\n", error);
    process.exit(1);
  }

  // Graceful Shutdown
  const shutdownServer = (reason: string) => {
    console.log(`⚠ Shutting down due to ${reason}`);

    if (expressServer) {
      expressServer.close(() => {
        console.log("🔴 Server closed");
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  };

  process.on("uncaughtException", (error) => {
    console.log("❗ Uncaught Exception:", error);
    shutdownServer("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    console.log("❗ Unhandled Rejection:", reason);
    shutdownServer("unhandledRejection");
  });

  process.on("SIGTERM", () => shutdownServer("SIGTERM"));
};

main();
