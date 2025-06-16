import {
  createUser,
  getUser
} from "../services/user.service.js";
import {
  encryptData,
  decryptData,
  generateUserToken
} from "../utils/dataCrypto.util.js";
import {
  USER_TYPES
} from "../utils/user.util.js";


//Create Admin
const createAdmin = async (req, res) => {
  const {
    body
  } = req;
  body.email = body.email.toLowerCase();
  
  if (!body.password) body.password = "user";

  //Check if email and/or phone number already exists
  const existingUser = await getUser({
    $or: [{
      email: body.email
    }, {
      phoneNumber: body.phoneNumber
    }]
  });
  if (existingUser) {
    let message = "";
    if (existingUser.email === body.email) {
      message = "Email already exists";
    }
    if (existingUser.phoneNumber === body.phoneNumber) {
      message = message ? "Both email and password already exists" : "Phone number already exists"
    }
  }

  //hash password
  const hashedPassword = await encryptData(body.password);

  //create new admin
  const newAdmin = await createUser({
    ...body,
    password: hashedPassword,
    role: USER_TYPES.ADMIN
  });

  //create a token
  const token = generateUserToken(newAdmin);
  //return created token as cookie to user
  res.cookie("Token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 604800000,
  })

  return res.status(201).json({
    success: true,
    message: "User successfully created",
    data: newAdmin,
    // accessToken: token,
  });

}


//Login Admin
const login = async (req, res) => {
  const {
    body
  } = req;
  body.email = body.email.toLowerCase();

  //validate email
  const user = await getUser({
    email: body.email
  });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Email not found. Please signup",
    })
  }

  //validate password
  const isValid = await decryptData(body.password, user.password);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid Password",
    })
  }

  //create token
  const token = generateUserToken(user);
  //pass token as cookie
  res.cookie("Token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 604800000,
  });

  return res.status(200).json({
    success: true,
    message: "User successfully logged in",
    data: user,
    accessToken: token,
  });

}


//Logout Admin
const logout = async(req, res) => {
  res.cookie("Token", "", {
    httpOnly: true,
    expiresIn: new Date(0),
    // maxAge: new Date(0),
  });

  return res.status(200).json({
    success: true,
    message: "User successfully logged out",
  });
}


export { createAdmin, login, logout };