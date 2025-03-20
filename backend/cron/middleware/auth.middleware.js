import jwt from "jsonwebtoken";
/*
export const verifyJWT = (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    req.user = decoded;
    next();
  });
};
*/

// auth.middleware.js
export const verifyJWT = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Unauthorized");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: "Token expired" });
    } else {
      res.status(401).json({ message: "Invalid token" });
    }
  }
};