const db = require("../db/db");


// GET WORKSPACE USERS

const getWorkspaceUsers = (req, res) => {
  try {
    console.log("WORKSPACE USERS API HIT");

    const { workspaceId } = req.params;

    db.query(
      `
      SELECT users.id, users.username
      FROM workspace_members
      JOIN users
      ON workspace_members.user_id = users.id
      WHERE workspace_members.workspace_id = ?
      `,
      [workspaceId],
      (error, users) => {
        if (error) {
          console.log(error);

          return res.status(500).json({
            message: "Database Error",
          });
        }

        console.log("WORKSPACE USERS:", users);

        res.status(200).json(users);
      }
    );
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// GET ALL USERS

const getAllUsers = (req, res) => {

  const currentUserId = req.user.id;

  db.query(
    `
    SELECT id, username
    FROM users
    WHERE id != ?
    `,
    [currentUserId],
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
  getWorkspaceUsers,
  getAllUsers,
};