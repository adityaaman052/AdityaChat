import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/wechat.png";

export default function Contacts({ contacts, changeChat }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [loading, setLoading] = useState(true); // Loading state for fetching user data

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
    if (data) {
      setCurrentUserName(data.username);
      setCurrentUserImage(data.avatarImage);
      setLoading(false);
    }
  }, []);

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  if (loading) {
    return <LoadingMessage>Loading...</LoadingMessage>; // Display loading message while waiting for user data
  }

  return (
    <Container>
      <div className="brand">
        <img src={Logo} alt="logo" />
        <h3>talktime</h3>
      </div>
      <div className="contacts">
        {contacts.map((contact, index) => {
          return (
            <div
              key={contact._id}
              className={`contact ${index === currentSelected ? "selected" : ""}`}
              onClick={() => changeCurrentChat(index, contact)}
            >
              <div className="avatar">
                <img
                  src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                  alt={contact.username}
                />
              </div>
              <div className="username">
                <h3>{contact.username}</h3>
              </div>
            </div>
          );
        })}
      </div>
      <div className="current-user">
        <div className="avatar">
          <img
            src={`data:image/svg+xml;base64,${currentUserImage}`}
            alt="avatar"
          />
        </div>
        <div className="username">
          <h2>{currentUserName}</h2>
        </div>
      </div>
    </Container>
  );
}

const LoadingMessage = styled.div`
  text-align: center;
  font-size: 1.5rem;
  color: white;
  padding: 2rem;
`;

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  background-color: rgba(197, 225, 43, 0.42);

  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 2rem;
    }
    h3 {
      color: white;
      text-transform: uppercase;
    }
  }

  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;

    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: rgb(44, 33, 9);
        width: 0.1rem;
        border-radius: 1rem;
      }
    }

    .contact {
      background-color: rgb(44, 33, 9);
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;

      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }

    .selected {
      background-color: rgba(107, 80, 21, 0.64);
    }
  }

  .current-user {
    background-color: rgb(44, 33, 9);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;

    .avatar {
      img {
        height: 4rem;
        max-inline-size: 100%;
      }
    }

    .username {
      h2 {
        color: white;
      }
    }

    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;

      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
`;
