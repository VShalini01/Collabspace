import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/auth/register", formData);

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button}>
            Register
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}

        <p style={styles.text}>
          Already have an account?{" "}
          <Link to="/" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
  },

  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "10px",
    width: "350px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },

  title: {
    textAlign: "center",
    marginBottom: "25px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  input: {
    padding: "12px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },

  button: {
    padding: "12px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "15px",
  },

  message: {
    marginTop: "15px",
    textAlign: "center",
    color: "green",
  },

  text: {
    marginTop: "20px",
    textAlign: "center",
  },

  link: {
    color: "#4f46e5",
    textDecoration: "none",
  },
};

export default Register;