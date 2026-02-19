
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.auth?.role;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    next();
  };
};
