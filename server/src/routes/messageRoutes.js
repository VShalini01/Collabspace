const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  getWorkspaceMessages,
} = require("../controllers/messageController");

router.get(
  "/:workspaceId",
  verifyToken,
  getWorkspaceMessages
);

module.exports = router;