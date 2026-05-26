require("dotenv").config();

const db = require("./src/db/db");

const http = require("http");

const app = require("./src/app");

const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});


// STORE ONLINE USERS

const onlineUsers = new Map();


// SOCKET CONNECTION

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);


  // USER ONLINE

  socket.on("user_online", (userId) => {
    console.log("Received:",userId);
    onlineUsers.set(
      userId.toString(),
      socket.id
    );

    io.emit(
      "online_users",
      Array.from(onlineUsers.keys())
    );

    console.log(
      "Online Users:",
      Array.from(onlineUsers.keys())
    );
  });
  // SEND CURRENT ONLINE USERS

socket.on("get_online_users", () => {
  socket.emit(
    "online_users",
    Array.from(onlineUsers.keys())
  );

  console.log(
    "Sent Online Users:",
    Array.from(onlineUsers.keys())
  );
});


  // JOIN WORKSPACE

  socket.on(
    "join_workspace",
    (workspaceId) => {
      socket.join(workspaceId);

      console.log(
        `Socket ${socket.id} joined workspace ${workspaceId}`
      );
    }
  );

  socket.on(
  "join_dm",
  (conversationId) => {

    socket.join(
      `dm_${conversationId}`
    );

    console.log(
      `Socket joined DM room dm_${conversationId}`
    );
  }
);

  // SEND MESSAGE

  socket.on("send_message", (data) => {
    console.log(
      "Message Received:",
      data
    );

    db.query(
      `
      INSERT INTO messages
      (workspace_id, user_id, username, message)
      VALUES (?, ?, ?, ?)
      `,
      [
        data.workspaceId,
        data.userId,
        data.username,
        data.message,
      ],
      (error, result) => {
        if (error) {
          console.log(error);
          return;
        }

        io.to(data.workspaceId).emit(
          "receive_message",
          data
        );
      }
    );
  });
socket.on(
  "send_dm_message",
  (data) => {

    console.log(
      "DM MESSAGE:",
      data
    );

    db.query(
      `
      INSERT INTO direct_messages
      (
        conversation_id,
        sender_id,
        message
      )
      VALUES (?, ?, ?)
      `,
      [
        data.conversationId,
        data.senderId,
        data.message,
      ],
      (error, result) => {

        if (error) {
          console.log(error);
          return;
        }

        io.to(
          `dm_${data.conversationId}`
        ).emit(
          "receive_dm_message",
          data
        );

        console.log(
          "DM emitted"
        );
      }
    );
  }
);

  // DISCONNECT

  socket.on("disconnect", () => {
    console.log(
      "User Disconnected:",
      socket.id
    );

    for (const [
      userId,
      socketId,
    ] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
      }
    }

    io.emit(
      "online_users",
      Array.from(onlineUsers.keys())
    );

    console.log(
      "Online Users:",
      Array.from(onlineUsers.keys())
    );
  });
});


server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});