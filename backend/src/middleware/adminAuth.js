// backend/src/middleware/adminAuth.js
import jwt from "jsonwebtoken";
export default function adminAuth(req, res, next) {
  try {
    // Check if user info is available (set by verifyToken middleware)
    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized: No user found ❌" });
    }

    // Allow only admins
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied: Admins only ❌" });
    }

    // Continue to the next middleware or route
    next();
  } catch (error) {
    console.error("Admin auth error:", error.message);
    res.status(500).json({ msg: "Server error in adminAuth.js ❌" });
  }
}
