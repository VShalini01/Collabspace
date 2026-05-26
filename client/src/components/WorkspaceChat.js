import { useEffect, useState } from "react";

import API from "../services/api";

import { socket } from "../socket";

function WorkspaceChat({
  workspaceId,
  workspaceName,
}) {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const [workspaceUsers, setWorkspaceUsers] =
    useState([]);

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  // FETCH OLD MESSAGES

  const fetchMessages = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await API.get(
        `/messages/${workspaceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // FETCH WORKSPACE USERS

  const fetchWorkspaceUsers = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await API.get(
        `/users/workspace/${workspaceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "WORKSPACE USERS:",
        response.data
      );

      setWorkspaceUsers(response.data);

    } catch (error) {
      console.log(
        "WORKSPACE USERS ERROR:"
      );

      console.log(error);
    }
  };

  useEffect(() => {
    if (!workspaceId || !user) return;

    // JOIN ROOM

    socket.emit(
      "join_workspace",
      workspaceId
    );

    socket.emit("get_online_users");

    // RECEIVE ONLINE USERS

    const handleOnlineUsers = (users) => {
      console.log(
        "ONLINE USERS FROM SERVER:",
        users
      );

      setOnlineUsers(users);
    };

    socket.on(
      "online_users",
      handleOnlineUsers
    );

    // RECEIVE MESSAGES

    const handleReceiveMessage = (data) => {
      if(
        Number(data.workspaceId) ===
        Number(workspaceId)
      )
      setMessages((prev) => [
        ...prev,
        data,
      ]);
    };

    socket.on(
      "receive_message",
      handleReceiveMessage
    );

    fetchMessages();

    fetchWorkspaceUsers();

    return () => {
      socket.off(
        "receive_message",
        handleReceiveMessage
      );

      socket.off(
        "online_users",
        handleOnlineUsers
      );
    };
  }, [workspaceId]);

  // SEND MESSAGE

  const sendMessage = async () => {
    if (!message.trim()) return;

    const messageData = {
      workspaceId,
      userId: user.id,
      username: user.username,
      message,
      time: new Date().toLocaleTimeString(),
    };

    socket.emit(
      "send_message",
      messageData
    );

    setMessage("");
  };

  return (
    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.chatHeader}>
        <h2>{workspaceName}</h2>

        <p style={styles.subText}>
          Workspace Chat
        </p>
      </div>


      {/* USERS */}

      <div style={styles.usersSection}>
        <h3>Workspace Members</h3>

        {workspaceUsers.map((member) => {

           console.log(
    "Member ID:",
    member.id,
    "Online Users:",
    onlineUsers
  );

  const isOnline = onlineUsers.includes(
    String(member.id)
  );

          return (
            <div
              key={member.id}
              style={styles.userItem}
            >
              <span>
                {isOnline
                  ? "🟢"
                  : "⚪"}
              </span>

              <span>
                {member.username}
              </span>
            </div>
          );
        })}
      </div>


      {/* CHAT BOX */}

      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={styles.message}
          >
            <strong>
              {msg.username}
            </strong>

            <p>{msg.message}</p>

            <small>{msg.time}</small>
          </div>
        ))}
      </div>


      {/* INPUT */}

      <div style={styles.inputSection}>
        <input
          type="text"
          placeholder="Type message..."
          value={message}
          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }
          style={styles.input}
        />

        <button
          onClick={sendMessage}
          style={styles.button}
        >
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginTop: "10px",
  },

  chatHeader: {
    borderBottom: "1px solid #ddd",
    paddingBottom: "12px",
    marginBottom: "15px",
  },

  subText: {
    color: "gray",
    marginTop: "5px",
  },

  usersSection: {
    marginBottom: "20px",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "white",
  },

  userItem: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginTop: "10px",
    fontSize: "15px",
  },

  chatBox: {
    height: "350px",
    overflowY: "auto",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "15px",
    marginTop: "15px",
    backgroundColor: "#fafafa",
  },

  message: {
    backgroundColor: "white",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px",
    border: "1px solid #eee",
  },

  inputSection: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },

  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },

  button: {
    padding: "12px 18px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default WorkspaceChat;