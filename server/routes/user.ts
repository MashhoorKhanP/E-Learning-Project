import express from "express";
import {
  activateUser,
  getAllUsers,
  getUserInfo,
  loginUser,
  logoutUser,
  registerUser,
  socialAuth,
  updateAccessToken,
  updateBlockUnBlockUser,
  updateProfilePicture,
  updateUserInfo,
  updateUserPassword,
  updateUserRole,
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

userRouter.get("/get-users", isAuthenticated, authorizeRoles("admin"), getAllUsers);
userRouter.patch("/update-user-role", isAuthenticated, authorizeRoles("admin"), updateUserRole);
userRouter.patch("/update-user-status/:id", isAuthenticated, authorizeRoles("admin"), updateBlockUnBlockUser);

export default userRouter;
