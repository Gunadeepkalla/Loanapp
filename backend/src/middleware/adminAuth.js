import jwt from "jsonwebtoken";

export default function adminAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token ❌" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.is_admin)
      return res.status(403).json({ msg: "Access denied ❌ Not admin" });

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token ❌" });
  }
}
