const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    console.log(req.headers);

    const authHeader = req.headers.authorization;

    console.log("Auth Header:", authHeader);

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // Split header into parts
    const tokenParts = authHeader.split(" ");

    console.log("Token Parts:", tokenParts);

    // Extract token
    const token = tokenParts[1];

    console.log("Token:", token);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log(err);

        return res.status(403).json({
          message: "Invalid token",
        });
      }

      req.user = decoded;

      next();
    });
  } catch (error) {
    console.log(error);

    res.status(500).json(error);
  }
};

module.exports = verifyToken;