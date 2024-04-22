import { Request, Response, NextFunction } from "express";
import UserModel, { IUser } from "../models/user.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import {
  createActivationToken,
  verifyToken,
} from "../services/accountActivationToken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import ErrorHandler from "../utils/ErrorHandler";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getAllUsersService, getUserById, updateBlockUnBlockUserService, updateUserRoleService } from "../services/user.services";
import cloudinary from "cloudinary";

//Register User
export interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registerUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, avatar } = req.body as IRegistrationBody;
      const isEmailExist = await UserModel.findOne({ email });
      if (isEmailExist) {
        return next(
          new ErrorHandler("Email already exists!, Try another.", 400)
        );
      }
      const user: IRegistrationBody = {
        name:name,
        email,
        password,
      };

      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;
      const data = { user: { name: user.name }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mail.ejs"),
        data
      );
      console.log("Activation code: " + activationCode);
      try {
        // await sendMail({
        //   email: user.email,
        //   subject: "Activate your account",
        //   template: "activation-mail.ejs",
        //   data,
        // });
        res.status(200).json({
          success: true,
          message: `Please check your email : ${user.email} activate your account!`,
          activationToken: activationToken.token,
        });
      } catch (error) {
        const typedError = error as Error;
        return next(new ErrorHandler(typedError.message, 400));
      }
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Activate User
interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;
      const newUser: { user: IUser; activationCode: string } =
        await verifyToken(activation_token);
        console.log("newUser",newUser)
        console.log(activation_code,":",newUser.activationCode)
      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code!", 400));
      }

      const { name, email, password } = newUser.user;
      const isUserExists = await UserModel.findOne({ email });
      if (isUserExists) {
        return next(new ErrorHandler("Email already exits!", 400));
      }
      const user = await UserModel.create({
        name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfull!, Now Login",
      });
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Login user
interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;
      if (!email || !password) {
        return next(
          new ErrorHandler("Please enter your email and password!", 400)
        );
      }
      const user = await UserModel.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("Invalid email or password!", 400));
      }

      if(user?.isBlocked) {
        return next(new ErrorHandler("User is blocked by Admin!", 401));
      }

      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid email or password!", 400));
      }

      sendToken(user, 200, res);
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Logout User
export const logoutUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "", { maxAge: 1 });
      res.cookie("refresh_token", "", { maxAge: 1 });
      const userId = req.user?._id || "";
      redis.del(userId);
      res.status(200).json({
        success: true,
        message: "Logged out successfully!",
      });
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Update access token
export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token;
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as JwtPayload;
      const message = "Could not refresh token";
      if (!decoded) {
        return next(new ErrorHandler(message, 400));
      }
      const session = await redis.get(decoded.id as string);

      if (!session) {
        return next(new ErrorHandler("Please login for access this resources!", 400));
      }

      const user = JSON.parse(session);

      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
          expiresIn: "5m",
        }
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
          expiresIn: "3d",
        }
      );
      req.user = user;

      res.cookie("access_token", accessToken, accessTokenOptions);
      res.cookie("refresh_token", refreshToken, refreshTokenOptions);

      await redis.set(user._id, JSON.stringify(user), "EX", 604800 ); // 604800 means 7 days in seconds

      res.status(200).json({
        status: "success",
        accessToken: accessToken,
      });
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Get user info
export const getUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      getUserById(userId, res);
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Social auth
interface ISocialAuthBody {
  email: string;
  name: string;
  avatar: string;
}

export const socialAuth = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, avatar } = req.body as ISocialAuthBody;
      const user = await UserModel.findOne({ email });
      
      if (!user) {
        const newUser = await UserModel.create({ email, name, avatar, isVerified:true });
        sendToken(newUser, 200, res);
      } else {
        sendToken(user, 200, res);
      }
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Update user info
interface IUpdateUserInfo {
  name?: string;
  email?: string;
}

export const updateUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body as IUpdateUserInfo;
      const userId = req.user?._id;
      const user = await UserModel.findById(userId);

      if (name && user) {
        user.name = name;
      }

      await user?.save();
      await redis.set(userId, JSON.stringify(user));

      res.status(200).json({
        success: true,
        message: "User info updated successfully!",
        user,
      });
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Update user password
interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}
export const updateUserPassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpdatePassword;

      if (!oldPassword || !newPassword) {
        return next(
          new ErrorHandler("Please enter old and new passwords!", 400)
        );
      }

      const user = await UserModel.findById(req.user?._id).select("+password");

      if (user?.password === undefined) {
        return next(new ErrorHandler("Invalid user!", 400));
      }

      const isPasswordMatch = await user?.comparePassword(oldPassword);
      const isNewPasswordMatchOldPassword = await user?.comparePassword(
        newPassword
      );

      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid old password!", 400));
      }

      if (isNewPasswordMatchOldPassword) {
        return next(
          new ErrorHandler("New password should be different one!", 400)
        );
      }

      user.password = newPassword;
      await user.save();
      await redis.set(req.user?._id, JSON.stringify(user));

      res.status(201).json({
        success: true,
        message: "Password updated successfull!",
        user,
      });
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Update profile picture
interface IUpdateProfilePicture {
  avatar: {
    public_id: string;
    url: string;
  };
}
export const updateProfilePicture = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body;
      const userId = req.user?._id;
      const user = await UserModel.findById(userId);

      if (avatar && user) {
        if (user?.avatar?.public_id) {
          await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: `avatars/${userId}`,
            width: 150,
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        } else {
          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: `avatars/${userId}`,
            width: 150,
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        }
      }
      await user?.save();
      await redis.set(userId, JSON.stringify(user));

      res.status(200).json({
        success: true,
        message: "Profile picture updated successfully!",
        user,
      });
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Get all users - admin
export const getAllUsers = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllUsersService(res);
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Update user role - admin
export const updateUserRole = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {id,role} = req.body;
      updateUserRoleService(res, id, role);
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Block/ Unblock user - admin
export const updateBlockUnBlockUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    updateBlockUnBlockUserService(res, id)
  } catch (error) {
    const typedError = error as Error;
    return next(new ErrorHandler(typedError.message, 400));
  }
})
