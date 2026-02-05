import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { messageAPI } from '../utils/api';
import { getChatName, getChatAvatar, generateAvatar } from '../utils/helpers';
import { FiSend, FiUsers, FiMoreVertical, FiPaperclip, FiPhone, FiVideo } from 'react-icons/fi';
import Message from './Message';
import GroupInfoModal from './GroupInfoModal';
import EmojiPickerComponent from './EmojiPickerComponent';
import FileUpload from './FileUpload';
import IncomingCallModal from './IncomingCallModal';
import ActiveCallWindow from './ActiveCallWindow';
import { useWebRTC } from '../hooks/useWebRTC';
import './ChatWindow.css';

const ChatWindow = () => {
    const { user } = useAuth();
    const { selectedChat } = useChat();
    const { socket, joinChat, sendTyping, stopTyping, isTyping } = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const messageInputRef = useRef(null);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages();
            joinChat(selectedChat._id);
        }
    }, [selectedChat]);

    useEffect(() => {
        if (socket) {
            socket.on('message recieved', (newMessageReceived) => {
                if (selectedChat && newMessageReceived.chat._id === selectedChat._id) {
                    setMessages((prev) => [...prev, newMessageReceived]);
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('message recieved');
            }
        };
    }, [socket, selectedChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        if (!selectedChat) return;

        setLoading(true);
        try {
            const { data } = await messageAPI.fetchMessages(selectedChat._id);
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!selectedChat) return;

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Send typing event
        sendTyping(selectedChat._id);

        // Stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping(selectedChat._id);
        }, 3000);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !selectedChat) return;

        stopTyping(selectedChat._id);

        try {
            const { data } = await messageAPI.sendMessage(newMessage, selectedChat._id);
            setMessages((prev) => [...prev, data]);
            setNewMessage('');

            // Emit socket event
            if (socket) {
                socket.emit('new message', data);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleEmojiClick = (emoji) => {
        setNewMessage((prev) => prev + emoji);
        messageInputRef.current?.focus();
    };

    const handleFileSelect = async (file, preview) => {
        // For now, just send the file name as a message
        // In Phase 2, we'll implement actual file upload to backend
        const fileMessage = `📎 File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;

        try {
            const { data } = await messageAPI.sendMessage(fileMessage, selectedChat._id);
            setMessages((prev) => [...prev, data]);
            setShowFileUpload(false);

            if (socket) {
                socket.emit('new message', data);
            }
        } catch (error) {
            console.error('Failed to send file:', error);
        }
    };

    // WebRTC Calling
    const {
        myVideo,
        userVideo,
        receivingCall,
        caller,
        callAccepted,
        callType,
        startCall,
        answerCall,
        endCall,
        toggleAudio,
        toggleVideo
    } = useWebRTC(user?._id);

    const handleAudioCall = () => {
        if (!selectedChat || selectedChat.isGroupChat) return;
        const otherUser = selectedChat.users.find(u => u._id !== user._id);
        if (otherUser) {
            startCall(otherUser._id, false); // false = audio only
        }
    };

    const handleVideoCall = () => {
        if (!selectedChat || selectedChat.isGroupChat) return;
        const otherUser = selectedChat.users.find(u => u._id !== user._id);
        if (otherUser) {
            startCall(otherUser._id, true); // true = video call
        }
    };

    const handleAcceptCall = () => {
        answerCall();
    };

    const handleRejectCall = () => {
        endCall();
    };

    if (!selectedChat) {
        return (
            <div className="chat-window-empty">
                <div className="empty-state">
                    <FiUsers size={64} />
                    <h2>Welcome to Chat App</h2>
                    <p className="text-muted">Select a chat to start messaging</p>
                </div>
            </div>
        );
    }

    const chatName = getChatName(selectedChat, user);
    const chatAvatar = getChatAvatar(selectedChat, user);
    const avatar = generateAvatar(chatName);

    return (
        <>
            <div className="chat-window">
                {/* Chat Header */}
                <div className="chat-header">
                    <div className="chat-header-info">
                        {chatAvatar ? (
                            <img src={chatAvatar} alt={chatName} className="avatar" />
                        ) : (
                            <div className="avatar-placeholder" style={{ background: avatar.bg }}>
                                {avatar.text}
                            </div>
                        )}
                        <div>
                            <h3>{chatName}</h3>
                            {selectedChat.isGroupChat && (
                                <span className="text-muted">
                                    {selectedChat.users?.length} members
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="chat-header-actions">
                        {!selectedChat.isGroupChat && (
                            <>
                                <button
                                    className="btn btn-ghost"
                                    onClick={handleAudioCall}
                                    title="Audio call"
                                >
                                    <FiPhone size={20} />
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    onClick={handleVideoCall}
                                    title="Video call"
                                >
                                    <FiVideo size={20} />
                                </button>
                            </>
                        )}
                        {selectedChat.isGroupChat && (
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowGroupInfo(true)}
                            >
                                <FiMoreVertical size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <div className="messages-container">
                    {loading ? (
                        <div className="loading-state">
                            <span className="spinner"></span>
                            <p>Loading messages...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="empty-state">
                            <p className="text-muted">No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        <div className="messages-list">
                            {messages.map((message, index) => (
                                <Message
                                    key={message._id}
                                    message={message}
                                    isOwn={message.sender._id === user._id}
                                    showAvatar={
                                        index === 0 ||
                                        messages[index - 1].sender._id !== message.sender._id
                                    }
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {isTyping && (
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    )}
                </div>

                {/* Message Input */}
                <form className="message-input-container" onSubmit={handleSendMessage}>
                    <EmojiPickerComponent onEmojiClick={handleEmojiClick} />

                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setShowFileUpload(true)}
                        title="Attach file"
                    >
                        <FiPaperclip size={20} />
                    </button>

                    <input
                        ref={messageInputRef}
                        type="text"
                        className="message-input"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={handleTyping}
                    />

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!newMessage.trim()}
                    >
                        <FiSend size={18} />
                    </button>
                </form>
            </div>

            {showGroupInfo && (
                <GroupInfoModal
                    chat={selectedChat}
                    onClose={() => setShowGroupInfo(false)}
                />
            )}

            {showFileUpload && (
                <FileUpload
                    onFileSelect={handleFileSelect}
                    onClose={() => setShowFileUpload(false)}
                />
            )}

            {receivingCall && !callAccepted && (
                <IncomingCallModal
                    caller={caller}
                    callType={callType}
                    onAccept={handleAcceptCall}
                    onReject={handleRejectCall}
                />
            )}

            {callAccepted && (
                <ActiveCallWindow
                    myVideo={myVideo}
                    userVideo={userVideo}
                    callType={callType}
                    onEndCall={endCall}
                    onToggleAudio={toggleAudio}
                    onToggleVideo={toggleVideo}
                />
            )}
        </>
    );
};

export default ChatWindow;
