'use client';

import React, { useMemo, useState } from 'react';
import styles from './ChatList.module.css';
import { formatDistanceToNowStrict } from 'date-fns';
import { getAvatarFor } from '../utils/avatarHelper';

const ChatList = ({ conversations, onSelectChat, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredConversations = useMemo(() => {
        if (!searchTerm) {
            return conversations;
        }
        return conversations.filter(convo =>
            convo.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [conversations, searchTerm]);

    return (
        <div className={styles.chatListContainer}>
            <div className={styles.chatListHeader}>
                <div className={styles.headerUserInfo}>
                    <img src="/avatar-placeholder.png" alt="Your Avatar" className={styles.headerAvatar} />
                    <span className={styles.headerUserName}>Ayush Thakur</span>
                </div>
                <div className={styles.headerIcons}>
                    <span>🔄</span>
                    <span>➕</span>
                    <span>⋮</span>
                </div>
            </div>

            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search or start new chat"
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className={styles.conversationList}>
                {loading && <p style={{textAlign: 'center', marginTop: '20px'}}>Loading chats...</p>}
                {filteredConversations.map(convo => (
                    <div key={convo._id} className={styles.conversationItem} onClick={() => onSelectChat(convo)}>
                        <img src={getAvatarFor(convo._id)} alt="User Avatar" className={styles.convoAvatar} />
                        <div className={styles.convoDetails}>
                            <div className={styles.convoHeader}>
                                <span className={styles.convoName}>{convo.name}</span>
                                <span className={styles.convoTimestamp}>
                                    {formatDistanceToNowStrict(new Date(convo.lastMessageTimestamp), { addSuffix: true })}
                                </span>
                            </div>
                            <p className={styles.convoLastMessage}>{convo.lastMessage}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatList;