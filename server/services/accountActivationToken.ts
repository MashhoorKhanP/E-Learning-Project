import { IRegistrationBody } from "../controllers/user.controller";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import { IUser } from "../models/user.model";
dotenv.config();

export interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (
  user: IRegistrationBody
): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET as Secret,
    { expiresIn: "5m" }
  );

  return { token, activationCode };
};

export const verifyToken = async(activationToken: string): Promise<{ user: IUser; activationCode: string; }>  => {
  const newUser = jwt.verify(activationToken, process.env.ACTIVATION_SECRET as Secret) as {user:IUser; activationCode:string};
  return newUser;
}
