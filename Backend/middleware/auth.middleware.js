const jwt = require('jsonwebtoken');
 
// ── VERIFY JWT TOKEN ──────────────────────────────────
    const verifyToken = (req, res, next) => {

      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          error: 'Access denied. No token provided.'
        });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();           
      } catch (err) {
        return res.status(401).json({
          error: 'Invalid or expired token.'
        });
      }
    };
 
    // ── AUTHORIZE ROLES ───────────────────────────────────
    const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;           
    const allowed = roles.some(r => r.toLowerCase() === userRole.toLowerCase());
    if (!allowed) {
      return res.status(403).json({
        error: 'Forbidden. You do not have permission to do this.'
      });
    }
    next();
  };
};
 
    module.exports = { verifyToken, authorizeRoles };