import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import { AppError } from "../utils/appError.util.js";
import {
  handleImageUpdate,
  deleteImage,
  generatePublicIdBase,
  processImageUpload,
  cleanupTempUploads,
} from "../services/file.service.js";

//create user base service fxn
export const createUser = async (data, file) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //generate image permanent public ID base
    const publicIdBase = generatePublicIdBase();
    data.publicIdBase = publicIdBase;

    //process profile image with permanent public ID
    let image = null;

    if (file) {
      try {
        image = await processImageUpload(file, publicIdBase, 0);
      } catch (error) {
        console.error("Failed to process image:", error);

        throw new AppError("Image upload failed", 500);
      }

      data.profileImage = image;
    }

    const newUser = await UserModel.create([data], { session });

    await session.commitTransaction();

    return newUser[0];
  } catch (error) {
    await session.abortTransaction();

    await cleanupTempUploads(file);

    console.error("Error in createUser:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

//retrieve all users service
export const getAllUsers = async () => {
  try {
    const users = await UserModel.find();
  
    if (users.length === 0) {
      throw new AppError("No users found!", 404);
    }
  
    return users;
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    throw error;
  }
};

//retrieve user service
export const getUser = async (query) => {
  try {
    const user = await UserModel.findOne(query)
  
    if (!user) {
      throw new AppError("User not found or already deleted!", 404);
    }
  
    return user;
  } catch (error) {
    console.error("Error in getUser:", error);
    throw error;
  }
};

//update user service
export const updateUser = async (query, data, file) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await UserModel.findOne(query).session(session);

    if (!existingUser) {
      throw new AppError("User not found or already deleted!", 404);
    }

    //handle image update within transaction
    if (file) {
      try {
        const publicIdBase = existingUser.publicIdBase;
        const existingImage = existingUser.profileImage;

        data.profileImage = await handleImageUpdate(
          file,
          existingImage,
          publicIdBase,
          0
        );
      } catch (imageError) {
        throw new AppError(
          "Profile image update failed. User update was rolled back.",
          500
        );
      }
    }

    //update user
    const updatedUser = await UserModel.findOneAndUpdate(query, data, {
      new: true,
      session,
    })

    if (!updatedUser) {
      throw new AppError("User not updated", 400);
    }

    await session.commitTransaction();

    return updatedUser;
  } catch (error) {
    await session.abortTransaction();

    await cleanupTempUploads(file);

    console.error("Error in updateUser:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

//delete user service
export const deleteUser = async (query) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await UserModel.findOne(query).session(session);

    if (!existingUser) {
      throw new AppError("User not found or already deleted!", 404);
    }

    const publicId = existingUser.profileImage?.publicId;

    //delete user within transaction
    const deletedUser = await UserModel.findOneAndDelete(query, { session });

    if (!deletedUser) {
      throw new AppError("Failed to delete user!", 404);
    }

    //delete profile image if present
    if (publicId) {
      try {
        await deleteImage(publicId);
      } catch (cloudError) {
        console.error("Cloudinary error:", cloudError.message);

        throw new AppError(
          "Profile image deletion failed. User deletion was rolled back.",
          500
        );
      }
    }

    //commit the transaction
    await session.commitTransaction();

    return deletedUser;
  } catch (error) {
    await session.abortTransaction();

    console.error("Error in deleteUser:", error);
    throw error;
  } finally {
    session.endSession();
  }
};