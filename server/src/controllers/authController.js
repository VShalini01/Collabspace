const bcrypt = require("bcryptjs");
const db = require("../db/db");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check existing user
    const checkUserQuery = "SELECT * FROM users WHERE email = ?";

    db.query(checkUserQuery, [email], async (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length > 0) {
        return res.status(400).json({
          message: "User already exists",
        });
      }

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // insert user
      const insertQuery =
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

      db.query(
        insertQuery,
        [username, email, hashedPassword],
        (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }

          res.status(201).json({
            message: "User registered successfully",
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json(error);
  }
};


const jwt = require("jsonwebtoken");

const login = (req, res) => {
  try {
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";

    db.query(query, [email], async (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const user = result[0];

      const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({
          message: "Invalid password",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  register,
  login,
};