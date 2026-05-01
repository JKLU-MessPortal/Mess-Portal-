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
      sameSite: 'lax',
    });
    req.cookies['XSRF-TOKEN'] = token; // Add to current request
  }

  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Validate for unsafe methods
  const tokenFromCookie = req.cookies['XSRF-TOKEN'];
  const tokenFromHeader = req.headers['x-xsrf-token'];

  if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
    return res.status(403).json({ message: 'CSRF token validation failed' });
  }

  next();
};
