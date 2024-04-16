import { Response } from "express";
import { redis } from "../utils/redis";
import UserModel from "../models/user.model";
import exp from "constants";
// Get user by id
export const getUserById = async (id: string, res: Response) => {
  const userJSON = await redis.get(id);
  if (userJSON) {
    const user = JSON.parse(userJSON);
    res.status(201).json({
      success: true,
      user,
    });
  }
};

// Get all users
export const getAllUsersService = async (res: Response) => {
  const users = await UserModel.find()
    .select("-password")
    .sort({ createdAt: -1 });
  res.status(201).json({
    success: true,
    users,
  });
};

// Update user role
export const updateUserRoleService = async (
  res: Response,
  id: string,
  role: string
) => {
  const user = await UserModel.findByIdAndUpdate(id, { role }, { new: true });

  res.status(201).json({
    success:true,
    user
  });
};

export const updateBlockUnBlockUserService = async (res: Response, id: string) => {
  const user = await UserModel.findById(id);
  let message;
  if(user){
    user.isBlocked = !user.isBlocked;
    user.isBlocked ? message = "Blocked" : message = "Unblocked";
    await user.save();

    res.status(201).json({
      success: true,
      message:`${message} ${user.name} successfully!`,
      user
    })
  }
};
