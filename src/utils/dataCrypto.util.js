import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//fxn to hash/encrypt user password
const encryptData = async (dataToEncrypt) => {
  const salt = await bcrypt.genSalt(10);
  const hashedData = await bcrypt.hash(dataToEncrypt, salt);
  return hashedData;
};

//fxn to decrypt user password and compare passwords
const decryptData = async (dataToCompare, dataToDecrypt) => {
  return await bcrypt.compare(dataToCompare, dataToDecrypt);
};

//fxn to generate user token
const generateUserToken = (userData) => {
  return jwt.sign({
      id: userData.id,
      role: userData.role,
    }, process.env.SECRET, { expiresIn: 86400 });
};

//fxn to set auth cookie
const setAuthCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  };

  res.cookie("Token", token, cookieOptions);
};

//fxn to clear auth cookie
const clearAuthCookie = (res) => {
  res.cookie("Token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    expires: new Date(0),
  });
};


export { encryptData, decryptData, generateUserToken, setAuthCookie, clearAuthCookie };