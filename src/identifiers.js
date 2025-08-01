module.exports = (req, res, next) => {
  const fromAddresses = req.body.fromAddresses;

  if (!Array.isArray(fromAddresses) || fromAddresses.length === 0) {
    return res.status(400).json({ error: "fromAddresses must be a non-empty array." });
  }

  // Initialize osintData for further middlewares
  req.osintData = {
    fromAddresses,
    relatedAccounts: [],
  };

  next();
};
