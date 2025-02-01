import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/wechat.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginRoute } from "../utils/APIRoutes";

export default function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", password: "" });

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  // ✅ FIX: Added 'navigate' as a dependency to prevent React Hook warning
  useEffect(() => {
    if (localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/");
    }
  }, [navigate]);

  // Handles input change for username & password fields
  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  // Validates user input before sending login request
  const validateForm = () => {
    const { username, password } = values;
    if (username === "") {
      toast.error("Username is required.", toastOptions);
      return false;
    } else if (password === "") {
      toast.error("Password is required.", toastOptions);
      return false;
    }
    return true;
  };

  // Handles form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      const { username, password } = values;
      const { data } = await axios.post(loginRoute, {
        username,
        password,
      });

      if (data.status === false) {
        toast.error(data.msg, toastOptions);
      } else if (data.status === true) {
        localStorage.setItem(
          process.env.REACT_APP_LOCALHOST_KEY,
          JSON.stringify(data.user)
        );
        navigate("/");
      }
    }
  };

  return (
    <>
      <FormContainer>
        <form onSubmit={handleSubmit}>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h1>TalkTime</h1>
          </div>
          <input
            type="text"
            placeholder="Username"
            name="username"
            onChange={handleChange}
            min="3"
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={handleChange}
          />
          <button type="submit">Log In</button>
          <span>
            Don't have an account? <Link to="/register">Create One</Link>
          </span>
        </form>
      </FormContainer>
      <ToastContainer />
    </>
  );
}

// Styled Components for styling
const FormContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1a1a1a, #333333);

  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 6rem;
    }
    h1 {
      color: #ffd700;
      font-size: 3rem;
      font-family: "Poppins", sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.2rem;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: rgba(56, 57, 30, 0.8);
    border-radius: 1.5rem;
    padding: 4rem 3rem;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
  }

  input {
    background-color: transparent;
    padding: 1rem;
    border: 0.1rem solid #ffd700;
    border-radius: 0.5rem;
    color: #ffd700;
    width: 100%;
    font-size: 1rem;
    font-family: "Roboto", sans-serif;
    transition: border 0.3s ease;

    &:focus {
      border: 0.1rem solid #ffc107;
      outline: none;
      box-shadow: 0 0 8px #ffd700;
    }
  }

  button {
    background-color: rgb(245, 242, 61);
    color: #1a1a1a;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.5rem;
    font-size: 1.2rem;
    text-transform: uppercase;
    font-family: "Poppins", sans-serif;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #ffc107;
    }
  }

  span {
    color: #ffc107;
    font-family: "Roboto", sans-serif;
    font-size: 1rem;
    a {
      color: #ffc107;
      text-decoration: none;
      font-weight: bold;
    }
  }
`;

