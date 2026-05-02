const crypto = require('crypto');

exports.csrfProtection = (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  
  // Ensure the cookie exists
  let token = req.cookies['XSRF-TOKEN'];
  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // Needs to be false so Axios can read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    req.cookies['XSRF-TOKEN'] = token; // Add to current request
  }

  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Validate for unsafe methods
  const tokenFromCookie = req.cookies['XSRF-TOKEN'];
  const tokenFromHeader = req.headers['x-xsrf-token'];

  // Origin Validation (OWASP recommended defense) - crucial for cross-domain setups like Vercel + Render
  const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
  const requestOrigin = req.headers.origin;

  const isOriginValid = requestOrigin === allowedOrigin;
  const isTokenValid = tokenFromCookie && tokenFromHeader && tokenFromCookie === tokenFromHeader;

  // Accept either valid Origin OR valid token match (for same-domain/local setups)
  if (!isOriginValid && !isTokenValid) {
    return res.status(403).json({ message: 'CSRF token validation failed' });
  }

  next();
};
