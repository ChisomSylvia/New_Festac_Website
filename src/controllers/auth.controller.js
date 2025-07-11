import {
  changePassword,
  loginUser,
  refreshUserToken,
  signupUser,
} from "../services/auth.service.js";
import { AppError } from "../utils/appError.util.js";
import { clearAuthCookie, setAuthCookie } from "../utils/dataCrypto.util.js";

//create user
export const signup = async (req, res, next) => {
  try {
    const { validatedBody: data } = req;
    const { file } = req;
    data.email = data.email.toLowerCase();

    //save new super-admin details
    const result = await signupUser({ body: data }, file);

    //set auth cookie
    setAuthCookie(res, result.token);

    return res.status(201).json({
      success: true,
      message: "User successfully created",
      data: result.newUser,
    });
  } catch (error) {
    console.error("signup error:", error.message);

    //don't expose sensitive error details in production
    if (process.env.NODE_ENV === "production" && error.statusCode === 500) {
      return next(new AppError("Internal server error", 500));
    }

    next(error);
  }
};

//login user
export const login = async (req, res, next) => {
  try {
    const { validatedBody: data } = req;

    const result = await loginUser({ body: data });

    //set auth cookie
    setAuthCookie(res, result.token);

    return res.status(200).json({
      success: true,
      message: "User successfully logged in",
      data: result.user,
      accessToken: result.token,
    });
  } catch (error) {
    console.error("login error:", error.message);

    //don't expose sensitive error details in production
    if (process.env.NODE_ENV === "production" && error.statusCode === 500) {
      return next(new AppError("Internal server error", 500));
    }

    next(error);
  }
};

//logout user
export const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);

    return res.status(200).json({
      success: true,
      message: "User successfully logged out",
    });
  } catch (error) {
    console.error("logout error:", error.message);
    next(error);
  }
};

//change password
export const changePasswordCtrl = async (req, res, next) => {
  try {
    const { user } = req;
    const { validatedBody: data } = req;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    //ensure new password is different from current
    if (data.currentPassword === data.newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    //change password
    const result = await changePassword(user._id, data);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.updatedUser,
    });
  } catch (error) {
    console.error("Change password error:", error.message);
    next(error);
  }
};

//refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const {
      user
    } = req;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    //generate new token
    const result = await refreshUserToken(user);

    //set new auth cookie
    setAuthCookie(res, result.token);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: result.token,
    });
  } catch (error) {
    console.error("refresh token error:", error.message);
    next(error);
  }
};