import UserModel from "../models/user.model.js";

export const createUser = async (data) => {
  const newUser = await UserModel.create(data);
  return newUser;
};

export const getAllUsers = async () => {
  const users = await UserModel.find();
  return users;
};

export const getUser = async (query) => {
  const user = await UserModel.findOne(query);
  return user;
};

export const updateUser = async (query, data) => {
  const updatedUser = await UserModel.findOneAndUpdate(query, data, {
    new: true,
  });
  return updatedUser;
};

export const deleteUser = async (query) => {
  const deletedUser = await UserModel.findOneAndDelete(query);
  return deletedUser;
};