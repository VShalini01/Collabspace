import { useEffect, useState } from "react";

import API from "../services/api";

import { socket } from "../socket";

function DirectMessagesChat({
    conversationId,
    receiver,
}) {

    const user = JSON.parse(
  localStorage.getItem("user")
);
const [message, setMessage] =
  useState("");

const [messages, setMessages] =
  useState([]);
  const fetchMessages = async () => {

  try {

    const token =
      localStorage.getItem("token");

    const response = await API.get(
      `/dm/messages/${conversationId}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    setMessages(response.data);

  } catch (error) {

    console.log(error);
  }
};
useEffect(() => {

  if (!conversationId) return;

  // JOIN DM ROOM

  socket.emit(
    "join_dm",
    conversationId
  );

  // FETCH OLD MESSAGES

  fetchMessages();

  // RECEIVE REALTIME DM

  const handleReceiveDM = (data) => {
    console.log(
      "DM Message Received:",
      data
    );
    setMessages((prev) => [
      ...prev,
      data,
    ]);
  };

  socket.on(
    "receive_dm_message",
    handleReceiveDM
  );

  return () => {

    socket.off(
      "receive_dm_message",
      handleReceiveDM
    );
  };

}, [conversationId]);
const sendMessage = () => {

  if (!message.trim()) return;

  const messageData = {

    conversationId,

    senderId: user.id,

    senderUsername:
      user.username,

    message,

    time:
      new Date().toLocaleTimeString(),
  };

  socket.emit(
    "send_dm_message",
    messageData
  );

  setMessage("");
};

  return (

  <div style={styles.container}>

    {/* HEADER */}

    <div style={styles.header}>

      <h2>
        Chat with {receiver.username}
      </h2>

    </div>


    {/* CHAT BOX */}

    <div style={styles.chatBox}>

      {messages.map((msg, index) => (

        <div
          key={index}
          style={styles.message}
        >

          <strong>
            {msg.sender_username ||
             msg.senderUsername}
          </strong>

          <p>{msg.message}</p>

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
          setMessage(e.target.value)
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

  header: {
    borderBottom:
      "1px solid #ddd",
    paddingBottom: "10px",
    marginBottom: "15px",
  },

  chatBox: {
    height: "400px",
    overflowY: "auto",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "15px",
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

export default DirectMessagesChat;