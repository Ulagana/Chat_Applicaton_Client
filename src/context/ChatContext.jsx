import { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [chats, setChats] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const value = {
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notifications,
        setNotifications,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
