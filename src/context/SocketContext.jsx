import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const newSocket = io(SOCKET_URL);
            setSocket(newSocket);

            newSocket.emit('setup', user);
            newSocket.on('connected', () => setSocketConnected(true));
            newSocket.on('typing', () => setIsTyping(true));
            newSocket.on('stop typing', () => setIsTyping(false));

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user]);

    const joinChat = (chatId) => {
        if (socket) {
            socket.emit('join chat', chatId);
        }
    };

    const sendTyping = (room) => {
        if (socket) {
            socket.emit('typing', room);
        }
    };

    const stopTyping = (room) => {
        if (socket) {
            socket.emit('stop typing', room);
        }
    };

    const sendMessage = (message) => {
        if (socket) {
            socket.emit('new message', message);
        }
    };

    const value = {
        socket,
        socketConnected,
        typing,
        setTyping,
        isTyping,
        setIsTyping,
        joinChat,
        sendTyping,
        stopTyping,
        sendMessage,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
