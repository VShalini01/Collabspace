const express = require("express");


const {
  register,
  login,
} = require("../controllers/authController");

const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({
    message: "Protected profile route accessed",
    user: req.user,
  });
});

module.exports = router;