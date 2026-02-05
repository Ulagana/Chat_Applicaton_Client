// Format timestamp to readable format
export const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
        const minutes = Math.floor(diffInMs / (1000 * 60));
        return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    } else if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
};

// Get chat name for display
export const getChatName = (chat, currentUser) => {
    if (!chat) return '';

    if (chat.isGroupChat) {
        return chat.chatName;
    }

    // For 1-on-1 chats, return the other user's name
    const otherUser = chat.users?.find(user => user._id !== currentUser._id);
    return otherUser?.username || 'Unknown User';
};

// Get chat avatar
export const getChatAvatar = (chat, currentUser) => {
    if (!chat) return null;

    if (chat.isGroupChat) {
        return null; // Can use a group icon instead
    }

    const otherUser = chat.users?.find(user => user._id !== currentUser._id);
    return otherUser?.avatar || null;
};

// Generate avatar from username
export const generateAvatar = (username) => {
    const colors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
        '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'
    ];

    const index = username.charCodeAt(0) % colors.length;
    return {
        bg: colors[index],
        text: username.charAt(0).toUpperCase()
    };
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Check if user is sender
export const isSameSender = (messages, currentMessage, index, userId) => {
    return (
        index < messages.length - 1 &&
        (messages[index + 1].sender._id !== currentMessage.sender._id ||
            messages[index + 1].sender._id === undefined) &&
        messages[index].sender._id !== userId
    );
};

// Check if it's the last message from sender
export const isLastMessage = (messages, index, userId) => {
    return (
        index === messages.length - 1 &&
        messages[messages.length - 1].sender._id !== userId &&
        messages[messages.length - 1].sender._id
    );
};

// Check if same sender as previous message
export const isSameSenderMargin = (messages, currentMessage, index, userId) => {
    if (
        index < messages.length - 1 &&
        messages[index + 1].sender._id === currentMessage.sender._id &&
        messages[index].sender._id !== userId
    )
        return 33;
    else if (
        (index < messages.length - 1 &&
            messages[index + 1].sender._id !== currentMessage.sender._id &&
            messages[index].sender._id !== userId) ||
        (index === messages.length - 1 && messages[index].sender._id !== userId)
    )
        return 0;
    else return 'auto';
};

// Check if message is from current user
export const isSameUser = (messages, currentMessage, index) => {
    return index > 0 && messages[index - 1].sender._id === currentMessage.sender._id;
};
