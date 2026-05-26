const db = require("../db/db");


// CREATE OR GET CONVERSATION

const createOrGetConversation = (
  req,
  res
) => {

  const senderId = req.user.id;

  const { receiverId } = req.body;

  db.query(
    `
    SELECT *
    FROM direct_conversations
    WHERE
    (user1_id = ? AND user2_id = ?)
    OR
    (user1_id = ? AND user2_id = ?)
    `,
    [
      senderId,
      receiverId,
      receiverId,
      senderId,
    ],
    (error, results) => {

      if (error) {
        console.log(error);

        return res.status(500).json({
          message: "Server Error",
        });
      }

      // CONVERSATION EXISTS

      if (results.length > 0) {
        return res.status(200).json(
          results[0]
        );
      }

      // CREATE NEW CONVERSATION

      db.query(
        `
        INSERT INTO direct_conversations
        (user1_id, user2_id)
        VALUES (?, ?)
        `,
        [senderId, receiverId],
        (error, result) => {

          if (error) {
            console.log(error);

            return res.status(500).json({
              message: "Server Error",
            });
          }

          res.status(201).json({
            id: result.insertId,
            user1_id: senderId,
            user2_id: receiverId,
          });
        }
      );
    }
  );
};


// GET DM MESSAGES

const getDMMessages = (
  req,
  res
) => {

  const { conversationId } = req.params;

  db.query(
    `
    SELECT
      direct_messages.*,
      users.username
    FROM direct_messages
    JOIN users
    ON direct_messages.sender_id = users.id
    WHERE conversation_id = ?
    ORDER BY created_at ASC
    `,
    [conversationId],
    (error, results) => {

      if (error) {
        console.log(error);

        return res.status(500).json({
          message: "Server Error",
        });
      }

      res.status(200).json(results);
    }
  );
};


module.exports = {
  createOrGetConversation,
  getDMMessages,
};