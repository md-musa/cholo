import { Server as SocketIOServer } from "socket.io";
import { Server as ExpressServer } from "http";
import app, { socketHandler } from "./app";
import mongoose from "mongoose";
import config from "./config";
import { logger } from "./shared/logger";

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
