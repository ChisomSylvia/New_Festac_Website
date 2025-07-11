import jwt from "jsonwebtoken";
import { getUser } from "../services/user.service.js";

const authenticate = (allowedRoles = []) => {
  return (req, res, next) => {
    //get token from cookies or headers
    let token = req.cookies?.Token || req.headers.authorization;

    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }

    //if no cookie is found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token found, please log in",
      });
    }

    //decrypt token using async-safe jwt verify with cb
    jwt.verify(token, process.env.SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token, please log in",
        });
      }

      try {
        const user = await getUser({
          _id: decoded.id,
        });
        //deleted user?
        if (!user) {
          return res.status(401).json({
            success: false,
            message: "User not found or already deleted",
          });
        }

        //attach user to request
        req.user = user;

        //check if user has the right role
        if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
          next();
        } else {
          return res.status(403).json({
            success: false,
            message: "Unauthorized access",
          });
        }
      } catch (error) {
        console.error("Unexpected auth error:", error);
        next(error);
      }
    });
  };
};

const optionalAuth = (req, res, next) => {
  //get token from cookie or headers
  let token = req.cookies?.Token || req.headers.authorization;

  if (token && token.startsWith("Bearer ")) token = token.slice(7);

  //no token, proceed as guest
  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.SECRET, async (err, decoded) => {
    if (err) {
        //invalid/expired token? treat as guest
        req.user = null;
        return next();
      }

      try {
        const user = await getUser({ _id: decoded.id });

        //deleted user? treat as guest
        if (!user) {
          req.user = null;
          return next();
        }

        //attach user to request
        req.user = user;
        return next();

      } catch (error) {
        //unexpected error? treat as guest
        console.error("OptionalAuth error:", error);
        req.user = null;
        return next();
      }
    });
};

export { authenticate, optionalAuth };