const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Token header se lo
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided"
    });
  }

  // "Bearer token" se token nikaalo
  const token = authHeader.split(" ")[1];

  try {
    // Token verify karo
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "gfssecret"
    );

    // User id request me attach karo
    req.user = decoded;

    next(); // request aage bhejo
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

module.exports = authMiddleware;