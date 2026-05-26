const db = require("../db/db");

const getWorkspaceMessages = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    db.query(
      `
      SELECT * FROM messages
      WHERE workspace_id = ?
      ORDER BY created_at ASC
      `,
      [workspaceId],
      (error, results) => {
        if (error) {
          console.log(error);

          return res.status(500).json({
            message: "Database error",
          });
        }

        res.status(200).json(results);
      }
    );
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch messages",
    });
  }
};

module.exports = {
  getWorkspaceMessages,
};