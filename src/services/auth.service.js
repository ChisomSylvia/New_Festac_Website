import {
  decryptData,
  encryptData,
  generateUserToken,
} from "../utils/dataCrypto.util.js";
import { createUser, getUser } from "./user.service.js";
import { AppError } from "../utils/appError.util.js";
import UserModel from "../models/user.model.js";
import { cleanupTempUploads } from "./file.service.js";

//createUser service
export const signupUser = async (data, file) => {
  try {
    const { body } = data;

    //check if email and/or phone number already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }],
    });

    if (existingUser) {
      let message = "";
      if (existingUser.email === body.email) {
        message = "Email already exists";
      }
      if (existingUser.phoneNumber === body.phoneNumber) {
        message = message
          ? "Both email and phone number already exist"
          : "Phone number already exists";
      }

      throw new AppError(message, 409);
    }

    //hash password
    const hashedPassword = await encryptData(body.password);

    //create new super admin
    const newUser = await createUser(
      {
        ...body,
        password: hashedPassword,
      },
      file
    );

    //create a token
    const token = generateUserToken(newUser);

    return { newUser, token };
  } catch (error) {
    await cleanupTempUploads(file);

    console.error("Error in signupUser:", error);
    throw error;
  }
};

//login user service
export const loginUser = async (data) => {
  try {
    const { body } = data;

    //find user by email
    const user = await getUser({
      email: body.email,
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    //validate password
    const isValid = await decryptData(body.password, user.password);
    if (!isValid) {
      throw new AppError("Invalid email or Password", 401);
    }

    //create token
    const token = generateUserToken(user);

    return {
      user,
      token,
    };
  } catch (error) {
    console.error("Error in loginUser:", error);
    throw error;
  }
};

//change user password
export const changePassword = async (userId, data) => {
  try {
    //get user
    const user = await getUser({
      _id: userId,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    //verify current password
    const isValidPassword = await decryptData(
      data.currentPassword,
      user.password
    );
    if (!isValidPassword) {
      throw new AppError("Current password is incorrect", 401);
    }

    //hash new password
    const hashedNewPassword = await encryptData(data.newPassword);

    //update user password
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { password: hashedNewPassword },
      {new: true}
    );

    return {
      message: "Password changed successfully",
      updatedUser,
    };
  } catch (error) {
    console.error("error in changePassword:", error);
    throw error;
  }
};

//refresh user token
export const refreshUserToken = async (user) => {
  try {
    //generate new token
    const token = generateUserToken(user);

    return {
      token
    };
  } catch (error) {
    console.error("Error in refreshUserToken:", error);
    throw error;
  }
};