const express = require("express");

const verifyToken = require("../middleware/authMiddleware");

const {
  createWorkspace,
  getAllWorkspaces,
  joinWorkspace,
} = require("../controllers/workspaceController");

const router = express.Router();

router.post("/", verifyToken, createWorkspace);

router.get("/", verifyToken, getAllWorkspaces);

router.post("/:id/join", verifyToken, joinWorkspace);

module.exports = router;