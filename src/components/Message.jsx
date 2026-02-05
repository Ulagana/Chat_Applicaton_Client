import { generateAvatar, formatTime } from '../utils/helpers';
import './Message.css';

const Message = ({ message, isOwn, showAvatar }) => {
    const avatar = generateAvatar(message.sender.username);

    // Parse message content to detect media URLs
    const parseMessageContent = (content) => {
        const lines = content.split('\n');
        const mediaInfo = {
            type: null,
            url: null,
            caption: null
        };

        // Check if message contains media
        if (lines[0]?.startsWith('📷 Image:')) {
            mediaInfo.type = 'image';
            mediaInfo.caption = lines[0].replace('📷 Image: ', '');
            mediaInfo.url = lines[1];
        } else if (lines[0]?.startsWith('🎥 Video:')) {
            mediaInfo.type = 'video';
            mediaInfo.caption = lines[0].replace('🎥 Video: ', '');
            mediaInfo.url = lines[1];
        } else if (lines[0]?.startsWith('🎵 Audio:')) {
            mediaInfo.type = 'audio';
            mediaInfo.caption = lines[0].replace('🎵 Audio: ', '');
            mediaInfo.url = lines[1];
        } else if (lines[0]?.startsWith('📎 File:')) {
            mediaInfo.type = 'file';
            mediaInfo.caption = lines[0].replace('📎 File: ', '');
            mediaInfo.url = lines[1];
        }

        return mediaInfo;
    };

    const mediaInfo = parseMessageContent(message.content);

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
                    {mediaInfo.type === 'image' && mediaInfo.url ? (
                        <div className="message-media">
                            <img
                                src={mediaInfo.url}
                                alt={mediaInfo.caption}
                                className="message-image"
                                loading="lazy"
                            />
                            <p className="media-caption">{mediaInfo.caption}</p>
                        </div>
                    ) : mediaInfo.type === 'video' && mediaInfo.url ? (
                        <div className="message-media">
                            <video
                                src={mediaInfo.url}
                                controls
                                className="message-video"
                                preload="metadata"
                            />
                            <p className="media-caption">{mediaInfo.caption}</p>
                        </div>
                    ) : mediaInfo.type === 'audio' && mediaInfo.url ? (
                        <div className="message-media">
                            <audio
                                src={mediaInfo.url}
                                controls
                                className="message-audio"
                            />
                            <p className="media-caption">{mediaInfo.caption}</p>
                        </div>
                    ) : mediaInfo.type === 'file' && mediaInfo.url ? (
                        <div className="message-file">
                            <a href={mediaInfo.url} target="_blank" rel="noopener noreferrer" className="file-link">
                                📎 {mediaInfo.caption}
                            </a>
                        </div>
                    ) : (
                        <p>{message.content}</p>
                    )}
                </div>
                <span className="message-time">{formatTime(message.createdAt)}</span>
            </div>
        </div>
    );
};

export default Message;
