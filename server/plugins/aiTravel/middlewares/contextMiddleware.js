const contextMiddleware = (req, res, next) => {
  if (req.body && req.body.routePolyline) {
    req.normalizedPolyline = req.body.routePolyline;
  }
  // Enforce physical vehicle limits placeholder
  next();
};

module.exports = { contextMiddleware };
