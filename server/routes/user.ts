import express from "express";
import {
  activateUser,
  getUserInfo,
  loginUser,
  logoutUser,
  registerUser,
  socialAuth,
  updateAccessToken,
  updateProfilePicture,
  updateUserInfo,
  updateUserPassword,
} from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const userRouter = express.Router();

userRouter.post("/registration", registerUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login-user", loginUser);
userRouter.get("/logout-user", isAuthenticated, logoutUser);
userRouter.get("/refresh-token", updateAccessToken);
userRouter.get("/user-info", isAuthenticated, getUserInfo);
userRouter.post("/social-auth", socialAuth);

userRouter.patch("/update-user-info",isAuthenticated, updateUserInfo);
userRouter.patch("/update-user-password",isAuthenticated, updateUserPassword);
userRouter.patch("/update-user-avatar",isAuthenticated, updateProfilePicture);


export default userRouter;
