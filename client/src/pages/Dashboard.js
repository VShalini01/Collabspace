import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

import WorkspaceChat from "../components/WorkspaceChat";

import DirectMessagesChat from "../components/DirectMessagesChat";

import { socket } from "../socket";

function Dashboard() {

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const token =
    localStorage.getItem("token");

  const [workspaceData, setWorkspaceData] =
    useState({
      name: "",
      description: "",
    });

  const [workspaces, setWorkspaces] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [
    selectedWorkspace,
    setSelectedWorkspace,
  ] = useState(null);

  const [allUsers, setAllUsers] =
    useState([]);

  const [selectedDM, setSelectedDM] =
    useState(null);

  const [unreadCounts, setUnreadCounts] =
    useState({});

  const [
    workspaceSearch,
    setWorkspaceSearch,
  ] = useState("");

  const [userSearch, setUserSearch] =
    useState("");


  // FETCH WORKSPACES

  const fetchWorkspaces = async () => {

    try {

      const response = await API.get(
        "/workspaces",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setWorkspaces(response.data);

    } catch (error) {

      console.log(error);
    }
  };


  // FETCH USERS

  const fetchAllUsers = async () => {

    try {

      const response = await API.get(
        "/users",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setAllUsers(response.data);

    } catch (error) {

      console.log(error);
    }
  };


  // INITIAL LOAD

  useEffect(() => {

    fetchWorkspaces();

    fetchAllUsers();

  }, []);


  // SOCKET CONNECTION

  useEffect(() => {

    if (user?.id) {

      if (!socket.connected) {

        socket.connect();
      }

      socket.on("connect", () => {

        console.log(
          "emit user online:",
          user.id
        );

        socket.emit(
          "user_online",
          user.id
        );
      });
    }

    return () => {

      socket.off("connect");
    };

  }, []);


  // RESTORE CHAT AFTER REFRESH

  useEffect(() => {

    const savedWorkspace =
      localStorage.getItem(
        "selectedWorkspace"
      );

    const savedDM =
      localStorage.getItem(
        "selectedDM"
      );

    if (savedWorkspace) {

      setSelectedWorkspace(
        JSON.parse(savedWorkspace)
      );
    }

    if (savedDM) {

      setSelectedDM(
        JSON.parse(savedDM)
      );
    }

  }, []);


  // UNREAD COUNTS

  useEffect(() => {

    socket.on(
      "receive_message",
      (data) => {

        if (
          selectedWorkspace?.id !==
          data.workspaceId
        ) {

          setUnreadCounts((prev) => ({
            ...prev,

            [data.workspaceId]:
              (prev[data.workspaceId] ||
                0) + 1,
          }));
        }
      }
    );

    return () => {

      socket.off("receive_message");
    };

  }, [selectedWorkspace]);


  // INPUT CHANGE

  const handleChange = (e) => {

    setWorkspaceData({
      ...workspaceData,

      [e.target.name]:
        e.target.value,
    });
  };


  // CREATE WORKSPACE

  const handleCreateWorkspace =
    async (e) => {

      e.preventDefault();

      try {

        const response =
          await API.post(
            "/workspaces",
            workspaceData,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setMessage(
          response.data.message
        );

        setWorkspaceData({
          name: "",
          description: "",
        });

        fetchWorkspaces();

      } catch (error) {

        console.log(error);

        setMessage(
          "Failed to create workspace"
        );
      }
    };


  // JOIN WORKSPACE

  const handleJoinWorkspace =
    async (workspaceId) => {

      try {

        const response =
          await API.post(
            `/workspaces/${workspaceId}/join`,
            {},
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setMessage(
          response.data.message
        );

        fetchWorkspaces();

      } catch (error) {

        console.log(error);

        setMessage(
          error.response?.data
            ?.message ||
            "Failed to join workspace"
        );
      }
    };


  // OPEN DM

  const handleDMClick = async (
    receiver
  ) => {

    try {

      const response =
        await API.post(
          "/dm/conversation",
          {
            receiverId:
              receiver.id,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setSelectedDM({
        conversationId:
          response.data.id,

        receiver,
      });

      localStorage.setItem(
        "selectedDM",

        JSON.stringify({
          conversationId:
            response.data.id,

          receiver,
        })
      );

      localStorage.removeItem(
        "selectedWorkspace"
      );

      setSelectedWorkspace(null);

    } catch (error) {

      console.log(error);
    }
  };


  // LOGOUT

  const handleLogout = () => {

    socket.disconnect();

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "selectedWorkspace"
    );

    localStorage.removeItem(
      "selectedDM"
    );

    navigate("/");
  };


  // FILTERED WORKSPACES

  const filteredWorkspaces =
    workspaces.filter(
      (workspace) =>

        workspace.name
          .toLowerCase()
          .includes(
            workspaceSearch.toLowerCase()
          )
    );


  // FILTERED USERS

  const filteredUsers =
    allUsers.filter((member) =>

      member.username
        .toLowerCase()
        .includes(
          userSearch.toLowerCase()
        )
    );


  return (

    <div style={styles.container}>


      {/* SIDEBAR */}

      <div style={styles.sidebar}>


        {/* WORKSPACES */}

        <h2 style={styles.sidebarTitle}>
          Workspaces
        </h2>


        {/* SEARCH */}

        <input
          type="text"
          placeholder="Search workspace..."
          value={workspaceSearch}
          onChange={(e) =>
            setWorkspaceSearch(
              e.target.value
            )
          }
          style={styles.input}
        />


        {/* CREATE FORM */}

        <form
          onSubmit={
            handleCreateWorkspace
          }
          style={styles.form}
        >

          <input
            type="text"
            name="name"
            placeholder="Workspace Name"
            value={workspaceData.name}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={
              workspaceData.description
            }
            onChange={handleChange}
            style={styles.textarea}
            required
          />

          <button
            type="submit"
            style={styles.createBtn}
          >
            Create
          </button>

        </form>


        {message && (

          <p style={styles.message}>
            {message}
          </p>
        )}


        {/* WORKSPACE LIST */}

        <div style={styles.workspaceList}>

          {filteredWorkspaces.map(
            (workspace) => (

              <div
                key={workspace.id}
                style={
                  styles.workspaceItem
                }
              >

                <div
                  style={
                    styles.workspaceHeader
                  }
                >

                  <h4>
                    {workspace.name}
                  </h4>

                  {unreadCounts[
                    workspace.id
                  ] > 0 && (

                    <span
                      style={
                        styles.badge
                      }
                    >
                      {
                        unreadCounts[
                          workspace.id
                        ]
                      }
                    </span>
                  )}
                </div>


                {workspace.joined ? (

                  <div
                    style={
                      styles.clickableWorkspace
                    }

                    onClick={() => {

                      setSelectedWorkspace(
                        workspace
                      );

                      localStorage.setItem(
                        "selectedWorkspace",

                        JSON.stringify(
                          workspace
                        )
                      );

                      localStorage.removeItem(
                        "selectedDM"
                      );

                      setSelectedDM(
                        null
                      );

                      setUnreadCounts(
                        (prev) => ({
                          ...prev,

                          [workspace.id]:
                            0,
                        })
                      );
                    }}
                  >

                    Chat

                  </div>

                ) : (

                  <button
                    style={
                      styles.joinBtn
                    }

                    onClick={() =>
                      handleJoinWorkspace(
                        workspace.id
                      )
                    }
                  >

                    Join

                  </button>
                )}

              </div>
            )
          )}

        </div>


        {/* DM SECTION */}

        <div style={styles.dmSection}>

          <h2
            style={styles.sidebarTitle}
          >
            Direct Messages
          </h2>


          {/* USER SEARCH */}

          <input
            type="text"
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) =>
              setUserSearch(
                e.target.value
              )
            }
            style={styles.input}
          />


          {filteredUsers.map(
            (member) => (

              <div
                key={member.id}
                style={
                  styles.workspaceItem
                }
              >

                <h4>
                  {member.username}
                </h4>

                <button
                  style={
                    styles.joinBtn
                  }

                  onClick={() =>
                    handleDMClick(
                      member
                    )
                  }
                >

                  Chat

                </button>

              </div>
            )
          )}

        </div>


        {/* LOGOUT */}

        <button
          onClick={handleLogout}
          style={styles.logoutBtn}
        >
          Logout
        </button>

      </div>


      {/* CHAT SECTION */}

      <div style={styles.chatSection}>


        {selectedWorkspace ? (

          <WorkspaceChat
            workspaceId={
              selectedWorkspace.id
            }

            workspaceName={
              selectedWorkspace.name
            }
          />

        ) : selectedDM ? (

          <DirectMessagesChat
            conversationId={
              selectedDM.conversationId
            }

            receiver={
              selectedDM.receiver
            }
          />

        ) : (

          <div style={styles.emptyChat}>

            <h2>
              Select a chat
            </h2>

            <p>
              Open a workspace or DM
              to start chatting.
            </p>

          </div>
        )}

      </div>

    </div>
  );
}


const styles = {

  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#eef2f7",
  },

  sidebar: {
  width: "26%",
  backgroundColor: "white",
  padding: "24px",
  borderRight: "1px solid #e5e7eb",
  overflowY: "auto",
  boxShadow: "2px 0 10px rgba(0,0,0,0.04)",
},

  sidebarTitle: {
    marginBottom: "20px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  input: {
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  outline: "none",
  fontSize: "14px",
  backgroundColor: "#f9fafb",
},

  textarea: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    minHeight: "70px",
  },

  createBtn: {
  padding: "12px",
  background:
    "linear-gradient(135deg,#6366f1,#4f46e5)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "0.2s",
},

  workspaceList: {
    marginTop: "25px",
  },

  workspaceItem: {
  padding: "14px",
  borderRadius: "14px",
  marginBottom: "16px",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  transition: "0.2s",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
},

  workspaceHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  joinBtn: {
  marginTop: "10px",
  padding: "10px 16px",
  backgroundColor: "#4f46e5",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
},

  clickableWorkspace: {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#eef2ff",
    color: "#4f46e5",
    borderRadius: "5px",
    cursor: "pointer",
    textAlign: "center",
    fontWeight: "bold",
  },

  badge: {
    backgroundColor: "red",
    color: "white",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "13px",
    fontWeight: "bold",
  },

  dmSection: {
    marginTop: "30px",
  },

  logoutBtn: {
    marginTop: "20px",
    width: "100%",
    padding: "12px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  chatSection: {
    width: "75%",
    padding: "20px",
    backgroundColor: "#f3f6f6",
  },

 emptyChat: {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  color: "#6b7280",
  backgroundColor: "white",
  borderRadius: "18px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
},

  message: {
    color: "green",
    marginTop: "10px",
  },
};

export default Dashboard;