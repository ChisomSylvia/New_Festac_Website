import jwt from "jsonwebtoken";
import { getUser } from "../services/user.service.js"


const authenticate = (allowedRoles = []) => {
  return async(req, res, next) => {
    //get token from cookies or authorization headers
    let token = await req.cookies.Token || req.headers.authorization;
    //if token is on the header, remove the "Bearer " prefix
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }
    // let token = await req.cookies.Token || req.headers.authorization?.replace("Bearer ", "");

    //if no cookie is found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token found, please log in"
      })
    }

    //decrypt found token
    jwt.verify(token, process.env.SECRET, async (err, decoded) => {
      //expired cookie?
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid token, please log in"
        })
      }

      //get user details with the email returned from the cookie
      const user = await getUser({ email: decoded.email });
      //deleted user?
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email, please sign up"
        })
      }

      //attach user to request
      req.user = user;

      //check if user has the right role
      if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access"
        });
      }
    })
  }
}

export default authenticate;