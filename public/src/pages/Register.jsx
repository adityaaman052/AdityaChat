import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/wechat.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerRoute } from "../utils/APIRoutes";

export default function Register() {
  const navigate = useNavigate();
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleValidation = () => {
    const { password, confirmPassword, username, email } = values;
    if (password !== confirmPassword) {
      toast.error(
        "Password and confirm password should be the same.",
        toastOptions
      );
      return false;
    } else if (username.length < 3) {
      toast.error(
        "Username should be greater than 3 characters.",
        toastOptions
      );
      return false;
    } else if (password.length < 8) {
      toast.error(
        "Password should be equal to or greater than 8 characters.",
        toastOptions
      );
      return false;
    } else if (email === "") {
      toast.error("Email is required.", toastOptions);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      const { email, username, password } = values;

      try {
        const { data } = await axios.post(registerRoute, {
          username,
          email,
          password,
        });

        if (data.status === false) {
          toast.error(data.msg, toastOptions);
        }
        if (data.status === true) {
          localStorage.setItem(
            process.env.REACT_APP_LOCALHOST_KEY,
            JSON.stringify(data.user)
          );
          navigate("/");
        }
      } catch (err) {
        // Handle network or server errors
        if (err.response) {
          // The request was made and the server responded with an error status code
          toast.error(`Error: ${err.response.data.msg}`, toastOptions);
        } else if (err.request) {
          // The request was made but no response was received
          toast.error("Network Error: Server is not reachable", toastOptions);
        } else {
          // Something happened in setting up the request
          toast.error(`Error: ${err.message}`, toastOptions);
        }
      }
    }
  };

  return (
    <>
      <FormContainer>
        <form action="" onSubmit={handleSubmit}>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h1>TalkTime</h1>
          </div>
          <input
            type="text"
            placeholder="Username"
            name="username"
            onChange={handleChange}
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            onChange={handleChange}
          />
          <button type="submit">Create User</button>
          <span>
            Already have an account? <Link to="/login">Login</Link>
          </span>
        </form>
      </FormContainer>
      <ToastContainer />
    </>
  );
}

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
    color: #ffd700;
    font-family: "Roboto", sans-serif;
    font-size: 1rem;
    a {
      color: #ffc107;
      text-decoration: none;
      font-weight: bold;
    }
  }
`;