const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Unauthorized User.');

  try {
    const decoded = jwt.verify(token, config.get('JWT_KEY'));
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).send('Invalid Token.');
  }
};
