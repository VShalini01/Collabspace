const db = require("../db/db");

const createWorkspace = (req, res) => {
  try {
    const { name, description } = req.body;

    const userId = req.user.id;

    const query =
      "INSERT INTO workspaces (name, description, created_by) VALUES (?, ?, ?)";

    db.query(
      query,
      [name, description, userId],
      (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        const workspaceId = result.insertId;

        // auto join creator
        const memberQuery =
          "INSERT INTO workspace_members (user_id, workspace_id) VALUES (?, ?)";

        db.query(
          memberQuery,
          [userId, workspaceId],
          (err) => {
            if (err) {
              return res.status(500).json(err);
            }

            res.status(201).json({
              message: "Workspace created successfully",
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

const getAllWorkspaces = (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        workspaces.*,
        EXISTS (
          SELECT 1
          FROM workspace_members
          WHERE workspace_members.workspace_id = workspaces.id
          AND workspace_members.user_id = ?
        ) AS joined
      FROM workspaces
      ORDER BY workspaces.created_at DESC
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.status(200).json(results);
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
const joinWorkspace = (req, res) => {
  try {
    const userId = req.user.id;

    const workspaceId = req.params.id;

    // check already joined
    const checkQuery =
      "SELECT * FROM workspace_members WHERE user_id = ? AND workspace_id = ?";

    db.query(
      checkQuery,
      [userId, workspaceId],
      (err, results) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (results.length > 0) {
          return res.status(400).json({
            message: "Already joined workspace",
          });
        }

        const joinQuery =
          "INSERT INTO workspace_members (user_id, workspace_id) VALUES (?, ?)";

        db.query(
          joinQuery,
          [userId, workspaceId],
          (err) => {
            if (err) {
              return res.status(500).json(err);
            }

            res.status(200).json({
              message: "Joined workspace successfully",
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  createWorkspace,
  getAllWorkspaces,
  joinWorkspace,
};