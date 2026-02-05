import { generateAvatar, formatTime } from '../utils/helpers';
import './Message.css';

const Message = ({ message, isOwn, showAvatar }) => {
    const avatar = generateAvatar(message.sender.username);

    return (
        <div className={`message ${isOwn ? 'own' : 'other'}`}>
            {!isOwn && showAvatar && (
                <div className="message-avatar">
                    {message.sender.avatar ? (
                        <img src={message.sender.avatar} alt={message.sender.username} className="avatar avatar-sm" />
                    ) : (
                        <div className="avatar-placeholder avatar-sm" style={{ background: avatar.bg }}>
                            {avatar.text}
                        </div>
                    )}
                </div>
            )}

            {!isOwn && !showAvatar && <div className="message-avatar-spacer" />}

            <div className="message-content">
                {!isOwn && showAvatar && (
                    <span className="message-sender">{message.sender.username}</span>
                )}
                <div className="message-bubble">
                    <p>{message.content}</p>
                </div>
                <span className="message-time">{formatTime(message.createdAt)}</span>
            </div>
        </div>
    );
};

export default Message;
