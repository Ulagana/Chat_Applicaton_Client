import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { FiSearch, FiLogOut, FiUsers, FiMenu } from 'react-icons/fi';
import ChatList from './ChatList';
import UserSearchModal from './UserSearchModal';
import GroupChatModal from './GroupChatModal';
import { generateAvatar } from '../utils/helpers';
import './Sidebar.css';

const Sidebar = ({ loading, fetchChats }) => {
    const { user, logout } = useAuth();
    const { chats } = useChat();
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const avatar = generateAvatar(user?.username || 'User');

    const filteredChats = chats.filter(chat => {
        const chatName = chat.isGroupChat
            ? chat.chatName
            : chat.users?.find(u => u._id !== user._id)?.username || '';
        return chatName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <>
            <div className="sidebar">
                {/* Header */}
                <div className="sidebar-header">
                    <div className="user-profile">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.username} className="avatar" />
                        ) : (
                            <div className="avatar-placeholder" style={{ background: avatar.bg }}>
                                {avatar.text}
                            </div>
                        )}
                        <div className="user-info">
                            <h3>{user?.username}</h3>
                            <span className="status-indicator">Online</span>
                        </div>
                    </div>
                    <button onClick={logout} className="btn btn-ghost" title="Logout">
                        <FiLogOut size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="sidebar-search">
                    <div className="search-input-wrapper">
                        <FiSearch size={18} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="sidebar-actions">
                    <button
                        className="btn btn-primary w-full"
                        onClick={() => setShowUserSearch(true)}
                    >
                        <FiSearch size={18} />
                        New Chat
                    </button>
                    <button
                        className="btn btn-secondary w-full"
                        onClick={() => setShowGroupModal(true)}
                    >
                        <FiUsers size={18} />
                        New Group
                    </button>
                </div>

                {/* Chat List */}
                <div className="sidebar-content">
                    {loading ? (
                        <div className="loading-state">
                            <span className="spinner"></span>
                            <p>Loading chats...</p>
                        </div>
                    ) : filteredChats.length === 0 ? (
                        <div className="empty-state">
                            <FiMenu size={48} />
                            <p>No chats yet</p>
                            <span className="text-muted">Start a new conversation</span>
                        </div>
                    ) : (
                        <ChatList chats={filteredChats} />
                    )}
                </div>
            </div>

            {showUserSearch && (
                <UserSearchModal
                    onClose={() => setShowUserSearch(false)}
                    fetchChats={fetchChats}
                />
            )}

            {showGroupModal && (
                <GroupChatModal
                    onClose={() => setShowGroupModal(false)}
                    fetchChats={fetchChats}
                />
            )}
        </>
    );
};

export default Sidebar;
