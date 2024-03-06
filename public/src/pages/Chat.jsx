import React, {useEffect,useState,useRef} from 'react';
import styled from "styled-components";
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import {allUsersRoute, host} from "../utils/APIroutes";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import ChatContainer from '../components/ChatContainer';

import {io} from "socket.io-client";

function Chat() {

  const socket=useRef();

  const navigate=useNavigate();
  const [contacts,setContacts]=useState([]);
  const [currentUser,setCurrentUser]=useState(undefined);
  const [currentChat,setCurrentChat]=useState(undefined);
  const [isLoaded,setIsLoaded]=useState(false);
  // useEffect(async()=>{
  //   if(!localStorage.getItem("chat-app-user")){
  //     navigate("/login");
  //   }
  //   else{
  //     setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
  //   }
  // },[]);

  // useEffect(async()=>{
  //   if(currentUser){
  //     if(currentUser.isAvatarImageSet){
  //       const data=await axios.get(`${allUsersRoute}/${currentUser._id}`);
  //       setContacts(data.data);
  //     }
  //     else{
  //       navigate("/setAvatar");
  //     }
  //   }
  // },[currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!localStorage.getItem("chat-app-user")) {
          navigate("/login");
        } else {
          setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Handle the error (e.g., redirect to an error page)
      }
    };
  
    fetchData();
  }, [navigate]);

  useEffect(()=>{
    if(currentUser){
      socket.current=io(host);
      socket.current.emit("add-user",currentUser._id);
    }
  },[currentUser]);
  
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (currentUser) {
          if (currentUser.isAvatarImageSet) {
            const response = await axios.get(`${allUsersRoute}/${currentUser._id}`);
            setContacts(response.data);
          } else {
            navigate("/setAvatar");
          }
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
        // Handle the error (e.g., show an error message)
      }
    };
  
    fetchContacts();
  }, [currentUser, navigate]);
  
  const handleChatChange=(chat)=>{
    setCurrentChat(chat);
  };


  return (
    <Container>
      <div className="container">
        <Contacts contacts={contacts} currentUser={currentUser} changeChat={handleChatChange} />
        {
          isLoaded && currentChat===undefined ? 
          (<Welcome currentUser={currentUser} />) : 
          (<ChatContainer currentChat={currentChat} currentUser={currentUser} socket={socket} />)
        }
      </div>
    </Container>
  );
}

const Container=styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;

    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;

export default Chat;