import jwt from "jsonwebtoken";
import { getUser } from "../services/user.service.js";

const authenticate = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      //get token from cookie or headers
      let token = req.cookies?.Token || req.headers.authorization;

      if (token && token.startsWith("Bearer ")) {
        token = token.slice(7);
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No token found, please log in",
        });
      }

      //verify token (synchronously with try/catch)
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.SECRET);
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token, please log in",
        });
      }

      //get user
      const user = await getUser({
        _id: decoded.id,
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found or already deleted",
        });
      }

      req.user = user;

      //role check
      if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
      }
    } catch (err) {
      next(err); // Pass other unexpected errors to global error handler
    }
  };
};

//optional Auth
const optionalAuth = async (req, res, next) => {
  try {
    //get token from cookie or headers
    let token = req.cookies?.Token || req.headers.authorization;

    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    //if no token, treat as guest
    if (!token) {
      req.user = null;
      return next();
    }

    //verify token synchronously with try/catch
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET);
    } catch (err) {
      req.user = null;
      return next(); // Invalid/expired token, treat as guest
    }

    //fetch user with decoded id
    const user = await getUser({
      _id: decoded.id,
    });

    if (!user) {
      req.user = null;
      return next(); // Deleted user, treat as guest
    }

    //attach user to request
    req.user = user;
    return next();
  } catch (err) {
    // If something else fails, treat as guest
    req.user = null;
    return next();
  }
};

// const authenticate = (allowedRoles = []) => {
//   return async (req, res, next) => {
//     //get token from cookies or authorization headers
//     let token = await req.cookies.Token || req.headers.authorization;

//     //if token is on the header, remove the "Bearer " prefix
//     if (token && token.startsWith("Bearer ")) {
//       token = token.slice(7, token.length);
//     }

//     //if no cookie is found
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "No token found, please log in"
//       })
//     }

//     //decrypt found token
//     jwt.verify(token, process.env.SECRET, async (err, decoded) => {
//       //expired cookie?
//       if (err) {
//         return res.status(401).json({
//           success: false,
//           message: "Invalid token, please log in"
//         })
//       }

//       //get user details with the id returned from the cookie
//       const user = await getUser({
//         _id: decoded.id
//       });

//       //deleted user?
//       if (!user) {
//         return res.status(401).json({
//           success: false,
//           message: "Invalid email, please sign up"
//         })
//       }

//       //attach user to request
//       req.user = user;

//       //check if user has the right role
//       if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
//         next();
//       } else {
//         return res.status(403).json({
//           success: false,
//           message: "Unauthorized access"
//         });
//       }
//     })
//   }
// }

// const optionalAuth = async (req, res, next) => {
//   //get token from cookies or authorization headers
//   let token = (await req.cookies.Token) || req.headers.authorization;

//   //if token is from Auth header, remove "Bearer "
//   if (token && token.startsWith("Bearer ")) {
//     token = token.slice(7, token.length);
//   }

//   //if no token found, treat as guest
//   if (!token) {
//     req.user = null;
//     return next();
//   }

//   //verify token
//   jwt.verify(token, process.env.SECRET, async (err, decoded) => {
//     //invalid/expired token? treat as guest
//     if (err || !decoded.id) {
//       req.user = null;
//       return next();
//     }

//     //get user details using decoded email
//     const user = await getUser({
//       _id: decoded.id,
//     });
//     //deleted user? treat as guest
//     if (!user) {
//       req.user = null;
//       return next();
//     }

//     //attach user to request
//     req.user = user;
//     return next();
//   });
// };

export { authenticate, optionalAuth };