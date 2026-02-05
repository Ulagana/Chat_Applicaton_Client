import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { getChatName, getChatAvatar, generateAvatar, formatTime, truncateText } from '../utils/helpers';
import './ChatList.css';

const ChatList = ({ chats }) => {
    const { user } = useAuth();
    const { selectedChat, setSelectedChat } = useChat();

    return (
        <div className="chat-list">
            {chats.map((chat) => {
                const chatName = getChatName(chat, user);
                const chatAvatar = getChatAvatar(chat, user);
                const avatar = generateAvatar(chatName);
                const isSelected = selectedChat?._id === chat._id;
                const latestMessage = chat.latestMessage?.content || 'No messages yet';
                const timestamp = chat.latestMessage?.createdAt;

                return (
                    <div
                        key={chat._id}
                        className={`chat-item ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedChat(chat)}
                    >
                        <div className="chat-avatar">
                            {chatAvatar ? (
                                <img src={chatAvatar} alt={chatName} className="avatar" />
                            ) : (
                                <div className="avatar-placeholder" style={{ background: avatar.bg }}>
                                    {avatar.text}
                                </div>
                            )}
                        </div>

                        <div className="chat-info">
                            <div className="chat-header-row">
                                <h4 className="chat-name">{chatName}</h4>
                                {timestamp && (
                                    <span className="chat-time">{formatTime(timestamp)}</span>
                                )}
                            </div>
                            <p className="chat-message text-muted">
                                {truncateText(latestMessage, 40)}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatList;
