import { useState } from 'react';
import { generateAvatar, formatTime } from '../utils/helpers';
import ReactionPicker from './ReactionPicker';
import AudioPlayer from './AudioPlayer';
import './Message.css';

const Message = ({ message, isOwn, showAvatar, onAddReaction, onRemoveReaction, currentUserId }) => {
    const [showReactionPicker, setShowReactionPicker] = useState(false);
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

    // Group reactions by emoji
    const groupedReactions = (message.reactions || []).reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = {
                count: 0,
                users: [],
                hasCurrentUser: false
            };
        }
        acc[reaction.emoji].count++;
        acc[reaction.emoji].users.push(reaction.user);
        if (reaction.user._id === currentUserId) {
            acc[reaction.emoji].hasCurrentUser = true;
        }
        return acc;
    }, {});

    const handleReactionSelect = (emoji) => {
        const existingReaction = groupedReactions[emoji];
        if (existingReaction && existingReaction.hasCurrentUser) {
            onRemoveReaction(message._id, emoji);
        } else {
            onAddReaction(message._id, emoji);
        }
        setShowReactionPicker(false);
    };

    const handleReactionClick = (emoji) => {
        const existingReaction = groupedReactions[emoji];
        if (existingReaction && existingReaction.hasCurrentUser) {
            onRemoveReaction(message._id, emoji);
        } else {
            onAddReaction(message._id, emoji);
        }
    };

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
                <div className="message-wrapper">
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
                        ) : message.type === 'voice' && message.content.includes('🎤') ? (
                            <div className="message-voice">
                                <AudioPlayer
                                    audioUrl={message.content.split('\n')[1]}
                                    duration={message.duration}
                                />
                            </div>
                        ) : (
                            <p>{message.content}</p>
                        )}
                    </div>

                    <ReactionPicker
                        onReactionSelect={handleReactionSelect}
                        onClose={() => setShowReactionPicker(false)}
                    />
                </div>

                {/* Display reactions */}
                {Object.keys(groupedReactions).length > 0 && (
                    <div className="message-reactions">
                        {Object.entries(groupedReactions).map(([emoji, data]) => (
                            <button
                                key={emoji}
                                className={`reaction-badge ${data.hasCurrentUser ? 'active' : ''}`}
                                onClick={() => handleReactionClick(emoji)}
                                title={`${data.users.map(u => u.username || 'User').join(', ')}`}
                            >
                                <span className="reaction-emoji">{emoji}</span>
                                <span className="reaction-count">{data.count}</span>
                            </button>
                        ))}
                    </div>
                )}

                <span className="message-time">{formatTime(message.createdAt)}</span>
            </div>
        </div>
    );
};

export default Message;
