// Exemplo: src/navigator/context/ContextIa.js
import React, { createContext, useContext, useState } from "react";

const ContextIa = createContext();

export const ConversationProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(false);
  
  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
    setUnread(true);
  };
  
  const markAsRead = () => {
    setUnread(false);
  };
  
  return (
    <ContextIa.Provider value={{ messages, addMessage, unread, markAsRead }}>
      {children}
    </ContextIa.Provider>
  );
};

export const useConversation = () => useContext(ContextIa);
