import express, { Request, Response, NextFunction } from "express";
export const app = express();
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "../middleware/error";
import userRouter from "../routes/user";
import courseRouter from "../routes/course";
import orderRouter from "../routes/order";
import notificationRouter from "../routes/notification";
import analyticsRouter from "../routes/analytics";
import layoutRouter from "../routes/layout";
dotenv.config();

app.use(express.json({ limit: "50mb" }));

app.use(cookieParser());

app.use(cors({ origin: process.env.CLIENT_URL,credentials:true }));

app.use("/api/v1", userRouter, courseRouter, orderRouter, notificationRouter, analyticsRouter, layoutRouter);

app.get("/test", (req: Request, res: Response, next: NextFunction) =>
  res.status(200).json({
    success: true,
    message: "API Successfully",
  })
);

// Unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
