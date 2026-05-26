const express = require("express");

const cors = require("cors");

const app = express();


// ROUTES

const authRoutes = require("./routes/authRoutes");

const workspaceRoutes = require(
  "./routes/workspaceRoutes"
);

const messageRoutes = require(
  "./routes/messageRoutes"
);

const userRoutes = require(
  "./routes/userRoutes"
);

const dmRoutes = require(
  "./routes/dmRoutes"
);



// MIDDLEWARE

app.use(cors());

app.use(express.json());


// API ROUTES

app.use("/auth", authRoutes);

app.use("/workspaces", workspaceRoutes);

app.use("/messages", messageRoutes);

app.use("/users", userRoutes);

app.use("/dm", dmRoutes);


// TEST ROUTE

app.get("/", (req, res) => {
  res.send("Backend API Running");
});


module.exports = app;