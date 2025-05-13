// Middleware to allow only donors
function isDonor(req, res, next) {
  if (!req.user || req.user.role !== 'donor') {
    return res.status(403).json({ message: 'Access denied. Donors only.' });
  }
  next();
}

module.exports = {
  isDonor,
};