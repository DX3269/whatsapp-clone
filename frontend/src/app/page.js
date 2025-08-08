'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import axios from 'axios';
import io from 'socket.io-client';

export default function Home() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://whatsapp-clone-backend-fer5.onrender.com/api/messages/conversations')
      .then(response => {
        setConversations(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch conversations:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const socket = io('https://whatsapp-clone-backend-fer5.onrender.com');
    
    socket.on('new_message', (newMessage) => {
      setConversations(prevConversations => {
        const otherConversations = prevConversations.filter(c => c._id !== newMessage.wa_id);
        const updatedConvo = {
          _id: newMessage.wa_id,
          name: newMessage.name,
          lastMessage: newMessage.body,
          lastMessageTimestamp: newMessage.timestamp,
        };
        // Put the updated conversation at the top of the list
        return [updatedConvo, ...otherConversations];
      });
    });

    // --- NEW EVENT LISTENER ---
    socket.on('conversation_updated', (updatedConvo) => {
        setConversations(prevConversations => {
            // Create a new array, replacing the old convo with the updated one
            const newConversations = prevConversations.map(c => 
                c._id === updatedConvo._id ? updatedConvo : c
            );
            // Sort again to ensure correct order
            return newConversations.sort((a, b) => new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp));
        });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <ChatList
            conversations={conversations}
            onSelectChat={handleSelectChat}
            loading={loading}
          />
        </div>
        <div className={styles.chatWindow}>
          {selectedChat ? (
            <ChatWindow chat={selectedChat} />
          ) : (
            <div className={styles.noChatSelected}>
              <img src="/whatsapp-connect-logo.png" alt="WhatsApp" style={{width: '250px'}} />
              <h2>WhatsApp Web</h2>
              <p>Send and receive messages without keeping your phone online.<br/>Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}