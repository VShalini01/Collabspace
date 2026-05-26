const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  getWorkspaceUsers,
  getAllUsers,
} = require("../controllers/userController");


// GET ALL USERS
router.get(
  "/",
  verifyToken,
  getAllUsers
);


// GET USERS OF A WORKSPACE

router.get(
  "/workspace/:workspaceId",
  verifyToken,
  getWorkspaceUsers
);

module.exports = router;