import "express-async-errors";
import cors from "cors";
import cookieParser from "cookie-parser";
import express, { Application, NextFunction, Request, Response } from "express";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import routeNotFoundError from "./app/middlewares/routeNotFoundError";
import { AuthRouter } from "./app/modules/auth/auth.route";
import { BusRouter } from "./app/modules/bus/bus.route";
import { UserRouter } from "./app/modules/user/user.route";
import { RouteRouter } from "./app/modules/route/route.route";
import { SOCKET_EVENTS } from "./constants";
import { broadcastLocation } from "./app/socket/broadcast";
import { ErrorLogRoute } from "./app/modules/errorLog/errorLog.route";
import { TripRoute } from "./app/modules/trip/trip.route";
import { CardRoute } from "./app/modules/card/card.route";
import { FareConfigRoute } from "./app/modules/fareConfig/fareConfig.route";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(req.url);
  next();
});

// routes
app.get("/", (req: Request, res: Response) => {
  res.send("HELLO WORLD");
});

app.use("/api/v1/trip", TripRoute);
app.use("/api/v1/card", CardRoute);
app.use("/api/v1/fare-config", FareConfigRoute);
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/buses", BusRouter);
app.use("/api/v1/routes", RouteRouter);
app.use("/api/v1/logs", ErrorLogRoute);
app.use(globalErrorHandler);
app.use(routeNotFoundError);



// ---------------------------
// Socket IO
// ---------------------------

export const socketHandler = (socket: any) => {
  console.log(`🟢 New client connected: ${socket.id}`);

  // 1️⃣ Bus broadcasts location updates
  socket.on(SOCKET_EVENTS.BROADCAST_BUS_LOCATION, broadcastLocation);

  // 2️⃣ Handle disconnection
  socket.on("disconnect", () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
};

export default app;
