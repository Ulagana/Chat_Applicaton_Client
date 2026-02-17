import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { messageAPI, uploadAPI } from '../utils/api';
import { getChatName, getChatAvatar, generateAvatar } from '../utils/helpers';
import { FiSend, FiUsers, FiMoreVertical, FiPaperclip, FiPhone, FiVideo, FiMic } from 'react-icons/fi';
import Message from './Message';
import GroupInfoModal from './GroupInfoModal';
import EmojiPickerComponent from './EmojiPickerComponent';
import FileUpload from './FileUpload';
import IncomingCallModal from './IncomingCallModal';
import ActiveCallWindow from './ActiveCallWindow';
import VoiceRecorder from './VoiceRecorder';
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
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
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

    // Listen for reaction updates
    useEffect(() => {
        if (socket) {
            socket.on('reaction-added', (updatedMessage) => {
                setMessages((prev) =>
                    prev.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg))
                );
            });

            socket.on('reaction-removed', (updatedMessage) => {
                setMessages((prev) =>
                    prev.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg))
                );
            });
        }

        return () => {
            if (socket) {
                socket.off('reaction-added');
                socket.off('reaction-removed');
            }
        };
    }, [socket]);

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
        try {
            setLoading(true);

            // Upload file to server
            const { data: uploadData } = await uploadAPI.uploadFile(file);

            // Determine file type and create appropriate message
            let fileMessage = '';
            const fileType = file.type.split('/')[0]; // 'image', 'video', 'audio', etc.

            if (fileType === 'image') {
                fileMessage = `📷 Image: ${file.name}`;
            } else if (fileType === 'video') {
                fileMessage = `🎥 Video: ${file.name}`;
            } else if (fileType === 'audio') {
                fileMessage = `🎵 Audio: ${file.name}`;
            } else {
                fileMessage = `📎 File: ${file.name}`;
            }

            // Add file URL to message
            fileMessage += `\n${uploadData.file.url}`;

            // Send message with file URL
            const { data } = await messageAPI.sendMessage(fileMessage, selectedChat._id);
            setMessages((prev) => [...prev, data]);
            setShowFileUpload(false);

            if (socket) {
                socket.emit('new message', data);
            }
        } catch (error) {
            console.error('Failed to upload file:', error);
            alert('Failed to upload file. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVoiceSend = async (file, duration) => {
        try {
            setLoading(true);

            // Upload voice file
            const { data: uploadData } = await uploadAPI.uploadFile(file);

            // Send message with voice URL and duration
            const voiceMessage = `🎤 Voice message (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})\n${uploadData.file.url}`;
            const { data } = await messageAPI.sendMessage(voiceMessage, selectedChat._id);

            // Update message type and duration
            data.type = 'voice';
            data.duration = duration;

            setMessages((prev) => [...prev, data]);
            setShowVoiceRecorder(false);

            if (socket) {
                socket.emit('new message', data);
            }
        } catch (error) {
            console.error('Failed to send voice message:', error);
            alert('Failed to send voice message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Reaction handlers
    const handleAddReaction = async (messageId, emoji) => {
        try {
            const { data } = await messageAPI.addReaction(messageId, emoji);
            setMessages((prev) =>
                prev.map((msg) => (msg._id === messageId ? data : msg))
            );

            // Emit socket event for real-time update
            if (socket) {
                socket.emit('add-reaction', {
                    chatId: selectedChat._id,
                    message: data
                });
            }
        } catch (error) {
            console.error('Failed to add reaction:', error);
        }
    };

    const handleRemoveReaction = async (messageId, emoji) => {
        try {
            const { data } = await messageAPI.removeReaction(messageId, emoji);
            setMessages((prev) =>
                prev.map((msg) => (msg._id === messageId ? data : msg))
            );

            // Emit socket event for real-time update
            if (socket) {
                socket.emit('remove-reaction', {
                    chatId: selectedChat._id,
                    message: data
                });
            }
        } catch (error) {
            console.error('Failed to remove reaction:', error);
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
        toggleVideo,
        stream
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
                                    onAddReaction={handleAddReaction}
                                    onRemoveReaction={handleRemoveReaction}
                                    currentUserId={user._id}
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

                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setShowVoiceRecorder(true)}
                        title="Record voice message"
                    >
                        <FiMic size={20} />
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

            {showVoiceRecorder && (
                <VoiceRecorder
                    onSend={handleVoiceSend}
                    onClose={() => setShowVoiceRecorder(false)}
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

            {(callAccepted || stream) && !receivingCall && (
                <ActiveCallWindow
                    myVideo={myVideo}
                    userVideo={userVideo}
                    callType={callType}
                    onEndCall={endCall}
                    onToggleAudio={toggleAudio}
                    onToggleVideo={toggleVideo}
                    isCalling={!callAccepted}
                    contactName={getChatName(selectedChat, user)}
                    hasStream={!!stream}
                />
            )}
        </>
    );
};

export default ChatWindow;
