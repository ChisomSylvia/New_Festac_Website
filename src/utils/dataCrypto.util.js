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
      _id: userData._id,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
    }, process.env.SECRET, { expiresIn: 604800 });
};


export { encryptData, decryptData, generateUserToken };