'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './ChatWindow.module.css';
import { format } from 'date-fns';
import io from 'socket.io-client';
import { getAvatarFor } from '../utils/avatarHelper';
import EmojiPicker from 'emoji-picker-react';
import StatusIcon from './StatusIcon';

const ChatWindow = ({ chat }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!chat) return;
        setLoading(true);
        const source = axios.CancelToken.source();
        axios.get(`https://whatsapp-clone-backend-fer5.onrender.com/api/messages/conversations/${chat._id}`, { cancelToken: source.token })
            .then(response => {
                setMessages(response.data);
                setLoading(false);
            })
            .catch(err => {
                if (!axios.isCancel(err)) {
                    console.error("Failed to fetch messages:", err);
                    setLoading(false);
                }
            });
        return () => {
            source.cancel();
        };
    }, [chat]);

    useEffect(() => {
        const socket = io('https://whatsapp-clone-backend-fer5.onrender.com');
        socket.on('new_message', (incomingMessage) => {
            if (chat && incomingMessage.wa_id === chat._id) {
                setMessages(prevMessages =>
                    [...prevMessages.filter(msg => msg._id !== incomingMessage.tempId), incomingMessage]
                );
            }
        });

        socket.on('status_update', (update) => {
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.meta_msg_id === update.id ? { ...msg, status: update.status } : msg
                )
            );
        });

        return () => {
            socket.disconnect();
        };
    }, [chat]);

    const onEmojiClick = (emojiObject) => {
        setNewMessage(prevInput => prevInput + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    const handleAttachmentClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        console.log("Selected file:", file.name);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        const tempId = 'temp-' + Date.now();
        const optimisticMessage = {
            _id: tempId,
            body: newMessage,
            timestamp: new Date().toISOString(),
            direction: 'outgoing',
            status: 'sent',
            meta_msg_id: 'temp-meta-' + Date.now()
        };
        setMessages(prevMessages => [...prevMessages, optimisticMessage]);
        setNewMessage('');
        try {
            await axios.post('https://whatsapp-clone-backend-fer5.onrender.com/api/messages/send', {
                wa_id: chat._id,
                name: chat.name,
                body: newMessage,
                tempId: tempId,
                meta_msg_id: optimisticMessage.meta_msg_id
            });
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    if (!chat) return null;

    return (
        <div className={styles.chatWindowContainer}>
            <div className={styles.chatHeader}>
                <img src={getAvatarFor(chat._id)} alt="Avatar" className={styles.avatar} />
                <div className={styles.chatInfo}>
                    <span className={styles.chatName}>{chat.name}</span>
                    <span className={styles.chatPhoneNumber}>+{chat._id}</span>
                </div>
            </div>

            <div className={styles.messageArea}>
                {loading ? <p>Loading messages...</p> : messages.map(msg => (
                    <div key={msg._id} className={styles.messageRow}>
                        <div className={
                            `${styles.messageBubble} ${msg.direction === 'outgoing' ? styles.outgoing : styles.incoming}`
                        }>
                            <p className={styles.messageBody}>{msg.body}</p>
                            <div className={styles.timestampWrapper}>
                                <span className={styles.messageTimestamp}>{format(new Date(msg.timestamp), 'p')}</span>
                                {msg.direction === 'outgoing' && <StatusIcon status={msg.status} />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.inputAreaWrapper}>
                {showEmojiPicker && (
                    <div className={styles.emojiPickerContainer}>
                        <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                )}
                <form className={styles.messageInputContainer} onSubmit={handleSendMessage}>
                    <button type="button" className={styles.iconButton} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😀</button>
                    <button type="button" className={styles.iconButton} onClick={handleAttachmentClick}>📎</button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <input
                        type="text"
                        placeholder="Type a message"
                        className={styles.messageInput}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onFocus={() => setShowEmojiPicker(false)}
                    />
                    <button type="submit" className={styles.iconButton}>
                        <img src="/send-icon.png" alt="Send" className={styles.sendIcon} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;