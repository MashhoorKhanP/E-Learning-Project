import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import NotificationModel from "../models/notification.model";
import ErrorHandler from "../utils/ErrorHandler";
import cron from 'node-cron';

// Get all notifications - admin
export const getAllNotifications = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await NotificationModel.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        notifications,
      });
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Update notification status - admin
export const updateNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await NotificationModel.findById(req.params.id);
      if (!notification) {
        return next(new ErrorHandler("Notification not found!", 404));
      }
      if (notification?.status) notification.status = "read";
      await notification.save();

      const notifications = await NotificationModel.find().sort({createdAt:-1});
      
      res.status(201).json({
        success: true,
        notifications,
      })
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);
