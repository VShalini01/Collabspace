const express = require("express");

const router = express.Router();

const {
  createOrGetConversation,
  getDMMessages,
} = require("../controllers/dmController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);


// CREATE / GET CONVERSATION

router.post(
  "/conversation",
  authMiddleware,
  createOrGetConversation
);


// GET MESSAGES

router.get(
  "/messages/:conversationId",
  authMiddleware,
  getDMMessages
);


module.exports = router;