import { Schema, model } from "mongoose";
import { USER_TYPES } from "../utils/user.util.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      required: true,
      enum: Object.values(USER_TYPES),
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const UserModel = new model("user", userSchema);
export default UserModel;