// backend/middleware/verifyToken.js
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // expected format: "Bearer <token>"
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT_SECRET in .env
    req.user = decoded; // decoded will contain uname, email, etc.
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token is invalid or expired" });
  }
};

export default verifyToken;
