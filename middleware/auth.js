const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'
  if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
  }  

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Using JWT_SECRET from .env
    req.user = decoded.user;
    console.log("Decoded user from token:", decoded.user);
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

module.exports = auth;


