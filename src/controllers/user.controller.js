import { USER_TYPES } from "../configs/constants.config.js";
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../services/user.service.js";

//retrieve all users
export const getAllUsersCtrl = async (req, res, next) => {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully!",
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("getAllUsersCtrl error:", error.message);
    next(error);
  }
};

//retrieve user
export const getUserCtrl = async (req, res, next) => {
  try {
    const query = {
      _id: req.validatedParams.id,
    };
    const userId = req.user.id;
    const userType = req.user.role;

    //check authorization
    if (
      query._id.toString() !== userId.toString() &&
      userType !== USER_TYPES.SUPERADMIN
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const user = await getUser(query);

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully!",
      data: user,
    });
  } catch (error) {
    console.error("getUserCtrl error:", error.message);
    next(error);
  }
};

//update user
export const updateUserCtrl = async (req, res, next) => {
  try {
    const { validatedBody: data } = req;
    const query = { _id: req.validatedParams.id };
    const { file } = req;
    const userId = req.user.id;
    const userType = req.user.role;

    //check authorization
    if (
      query._id.toString() !== userId.toString() &&
      userType !== USER_TYPES.SUPERADMIN
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const updatedUser = await updateUser(query, data, file);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("updateUserCtrl error:", error.message);
    next(error);
  }
};

//delete user
export const deleteUserCtrl = async (req, res, next) => {
  try {
    const query = {
      _id: req.validatedParams.id,
    };
    const userId = req.user.id;
    const userType = req.user.role;

    //check authorization
    if (
      query._id.toString() !== userId.toString() &&
      userType !== USER_TYPES.SUPERADMIN
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    //delete user from db
    const deletedUser = await deleteUser(query);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully!",
      data: deletedUser,
    });
  } catch (error) {
    console.error("deleteUserCtrl error:", error.message);
    next(error);
  }
};