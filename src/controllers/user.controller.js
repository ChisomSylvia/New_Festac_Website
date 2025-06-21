import { USER_TYPES } from "../configs/constants.config.js";
import { getAllUsers, getUser, updateUser, deleteUser } from "../services/user.service.js";

export const getAllUsersCtrl = async (req, res) => {
  const users = await getAllUsers();

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: "List is empty or has already been deleted!",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Users retrieved successfully!",
    data: users,
  });
};


export const getUserCtrl = async (req, res) => {
  const query = {
    _id: req.params.id
  };

  const user = await getUser(query);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found or already deleted!",
    });
  }
  return res.status(200).json({
    success: true,
    message: "User retrieved successfully!",
    data: user,
  });
};


export const updateUserCtrl = async (req, res) => {
  const {
    body
  } = req;
  const query = {
    _id: req.params.id
  };
  const userId = req.user._id;
  const userType = req.user.role;

  const existingUser = await getUser(query);
  if (!existingUser) {
    return res.status(404).json({
      success: false,
      message: "User with such Id does not exist",
    });
  }

  if (userType === USER_TYPES.ADMIN) {
    if (existingUser._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      })
    }
  }

  const updatedUser = await updateUser(query, body);
  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
}


export const deleteUserCtrl = async (req, res) => {
  const query = {
    _id: req.params.id
  };
  const userId = req.user._id;
  const userType = req.user.role;

  const user = await getUser(query);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found or already deleted!",
    });
  }

  if (userType === USER_TYPES.ADMIN) {
    if (user._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      })
    }
  }

  //delete intern from db
  const delUser = await deleteUser(query);

  return res.status(200).json({
    success: true,
    message: "User deleted successfully!",
    data: delUser,
  });
};