const jwt = require('jsonwebtoken');
 
    // CHECK 1: Is there a valid JWT token?
    const verifyToken = (req, res, next) => {
 
      // Get the token from the Authorization header
      // The header looks like: "Bearer eyJhbGci..."
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
 
      // If no token was sent, reject the request
      if (!token) {
        return res.status(401).json({
          error: 'Access denied. No token provided.'
        });
      }
 
      // Verify the token is valid and not expired
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // attach user info to the request
        next();             // allow the request to continue
      } catch (err) {
        return res.status(401).json({
          error: 'Invalid or expired token.'
        });
      }
    };
 
    // CHECK 2: Does the user have the required role?
    const authorizeRoles = (...roles) => {
      return (req, res, next) => {
         const userRole = req.user.role.toUpperCase();
    const allowedRoles = roles.map(r => r.toUpperCase());
        if (!roles.includes(req.user.role)) {
          return res.status(403).json({
            error: 'Forbidden. You do not have permission to do this.'
          });
        }
        next(); // role is allowed, continue
      };
    };
 
    module.exports = { verifyToken, authorizeRoles };