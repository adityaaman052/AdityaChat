 import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { allUsersRoute } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import { useSocket } from "../components/useSocket";
import styled from "styled-components"; // Make sure this is at the top of your file

export default function Chat() {
  const navigate = useNavigate();
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

  // Use custom socket hook
  const socket = useSocket(currentUser, setMessages);

  // Fetch contacts from server
// Fetch contacts from server
useEffect(() => {
  const fetchContacts = async () => {
    if (currentUser) {
      console.log("Current User ID:", currentUser._id);
console.log("API Route:", `${allUsersRoute}/${currentUser._id}`);

      if (currentUser.isAvatarImageSet) {
        try {
          console.log("Fetching contacts for:", currentUser._id);  // Debugging
          const { data } = await axios.get(`${allUsersRoute}/${currentUser._id}`);
          console.log("Contacts fetched:", data);  // Debugging
          setContacts(data);
        } catch (error) {
          console.error("Error fetching contacts:", error);
        }
      } else {
        navigate("/setAvatar");
      }
    }
  };
  fetchContacts();
}, [currentUser, navigate]);


  // Handle changing chat
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  // Function to send a message
  const sendMessage = (message) => {
    if (currentChat && socket.current) {
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
