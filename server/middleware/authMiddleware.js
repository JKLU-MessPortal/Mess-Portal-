const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  let token = req.cookies.jwt;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'default_fallback_secret');
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid Token." });
  }
};
