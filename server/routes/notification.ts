import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { getAllNotifications, updateNotification } from "../controllers/notification.controller";
const notificationRouter = express.Router();

notificationRouter.get("/get-all-notifications",isAuthenticated, authorizeRoles("admin"), getAllNotifications);
notificationRouter.patch("/update-notification/:id",isAuthenticated, authorizeRoles("admin"), updateNotification);


export default notificationRouter;