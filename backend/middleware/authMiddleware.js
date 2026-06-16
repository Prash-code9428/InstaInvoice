const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Enforces presence and validity of Bearer JWT token in Authorization header.
 * Attaches decoded user ID to req.user.
 */
module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Token format must be Bearer <token>' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id; // Attach authenticated user ID to request object
    next();
  } catch (error) {
    console.error(`Token verification error: ${error.message}`);
    return res.status(401).json({ error: 'Token is not valid or has expired' });
  }
};
