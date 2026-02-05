import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { chatAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import './ChatPage.css';

const ChatPage = () => {
    const { user } = useAuth();
    const { selectedChat, chats, setChats } = useChat();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        setLoading(true);
        try {
            const { data } = await chatAPI.fetchChats();
            setChats(data);
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-page">
            <Sidebar loading={loading} fetchChats={fetchChats} />
            <ChatWindow />
        </div>
    );
};

export default ChatPage;
