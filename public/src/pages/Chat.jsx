import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef(null);
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [messages, setMessages] = useState([]);

  // Fetch current user from localStorage
  useEffect(() => {
    const fetchUser = async () => {
      const localStorageKey = process.env.REACT_APP_LOCALHOST_KEY || "chat-user";
      if (!localStorage.getItem(localStorageKey)) {
        navigate("/login");
      } else {
        setCurrentUser(JSON.parse(localStorage.getItem(localStorageKey)));
      }
    };
    fetchUser();
  }, [navigate]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);

      const handleReceiveMessage = (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
      };

      socket.current.on("msg-recieve", handleReceiveMessage);

      return () => {
        socket.current.off("msg-recieve", handleReceiveMessage);
        socket.current.disconnect();
      };
    }
  }, [currentUser]);

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
          setContacts(data.data);
        } else {
          navigate("/setAvatar");
        }
      }
    };
    fetchContacts();
  }, [currentUser, navigate]);

  // Handle chat change
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  const sendMessage = (message) => {
    if (currentChat) {
      socket.current.emit("send-msg", {
        from: currentUser._id,
        to: currentChat._id,
        msg: message,
      });
    }
  };

  return (
    <Container>
      <div className="container">
        <Contacts contacts={contacts} changeChat={handleChatChange} />
        {currentChat === undefined ? (
          <Welcome />
        ) : (
          <ChatContainer
            currentChat={currentChat}
            socket={socket}
            sendMessage={sendMessage}
            messages={messages}
          />
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: rgb(42, 50, 24);
  .container {
    height: 85vh;
    width: 85vw;
    background-color: rgba(88, 93, 57, 0.46);
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
