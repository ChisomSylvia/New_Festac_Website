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

  const existingUser = await getUser(query);
  if (!existingUser) {
    return res.status(404).json({
      success: false,
      message: "User with such Id does not exist",
    });
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

  const user = await getUser(query);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found or already deleted!",
    });
  }

  //delete intern from db
  const delUser = await deleteUser(query);

  return res.status(200).json({
    success: true,
    message: "User deleted successfully!",
    data: delUser,
  });
};