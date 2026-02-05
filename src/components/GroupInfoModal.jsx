import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { chatAPI, authAPI } from '../utils/api';
import { FiX, FiEdit2, FiUserPlus, FiUserMinus, FiLogOut, FiSearch } from 'react-icons/fi';
import { generateAvatar } from '../utils/helpers';
import './Modal.css';

const GroupInfoModal = ({ chat, onClose }) => {
    const { user } = useAuth();
    const { setSelectedChat, setChats } = useChat();
    const [isEditing, setIsEditing] = useState(false);
    const [groupName, setGroupName] = useState(chat.chatName);
    const [showAddUser, setShowAddUser] = useState(false);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const isAdmin = chat.groupAdmin?._id === user._id;

    const handleRename = async () => {
        if (!groupName.trim() || groupName === chat.chatName) {
            setIsEditing(false);
            return;
        }

        try {
            const { data } = await chatAPI.renameGroup(chat._id, groupName);
            setSelectedChat(data);
            setChats(prev => prev.map(c => c._id === data._id ? data : c));
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to rename group:', error);
        }
    };

    const handleSearch = async (query) => {
        setSearch(query);

        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const { data } = await authAPI.searchUsers(query);
            // Filter out users already in the group
            const filtered = data.filter(u => !chat.users.find(cu => cu._id === u._id));
            setSearchResults(filtered);
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const handleAddUser = async (userId) => {
        setLoading(true);
        try {
            const { data } = await chatAPI.addToGroup(chat._id, userId);
            setSelectedChat(data);
            setChats(prev => prev.map(c => c._id === data._id ? data : c));
            setShowAddUser(false);
            setSearch('');
            setSearchResults([]);
        } catch (error) {
            console.error('Failed to add user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveUser = async (userId) => {
        if (!confirm('Are you sure you want to remove this user?')) return;

        try {
            const { data } = await chatAPI.removeFromGroup(chat._id, userId);
            setSelectedChat(data);
            setChats(prev => prev.map(c => c._id === data._id ? data : c));
        } catch (error) {
            console.error('Failed to remove user:', error);
        }
    };

    const handleLeaveGroup = async () => {
        if (!confirm('Are you sure you want to leave this group?')) return;

        try {
            await chatAPI.removeFromGroup(chat._id, user._id);
            setSelectedChat(null);
            setChats(prev => prev.filter(c => c._id !== chat._id));
            onClose();
        } catch (error) {
            console.error('Failed to leave group:', error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Group Info</h2>
                    <button className="btn btn-ghost" onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Group Name */}
                    <div className="group-name-section">
                        {isEditing ? (
                            <div className="flex gap-sm">
                                <input
                                    type="text"
                                    className="input-field"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    onBlur={handleRename}
                                    onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <h3>{chat.chatName}</h3>
                                {isAdmin && (
                                    <button className="btn btn-ghost" onClick={() => setIsEditing(true)}>
                                        <FiEdit2 size={18} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Members */}
                    <div className="group-members-section">
                        <div className="flex justify-between items-center mb-md">
                            <h4>{chat.users?.length} Members</h4>
                            {isAdmin && (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setShowAddUser(!showAddUser)}
                                >
                                    <FiUserPlus size={16} />
                                    Add User
                                </button>
                            )}
                        </div>

                        {showAddUser && (
                            <div className="add-user-section">
                                <div className="search-input-wrapper mb-md">
                                    <FiSearch size={18} />
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Search users..."
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>

                                <div className="search-results-compact">
                                    {searchResults.map((searchUser) => {
                                        const avatar = generateAvatar(searchUser.username);
                                        return (
                                            <div key={searchUser._id} className="user-item-compact">
                                                {searchUser.avatar ? (
                                                    <img src={searchUser.avatar} alt={searchUser.username} className="avatar avatar-sm" />
                                                ) : (
                                                    <div className="avatar-placeholder avatar-sm" style={{ background: avatar.bg }}>
                                                        {avatar.text}
                                                    </div>
                                                )}
                                                <span>{searchUser.username}</span>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleAddUser(searchUser._id)}
                                                    disabled={loading}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="members-list">
                            {chat.users?.map((member) => {
                                const avatar = generateAvatar(member.username);
                                const isMemberAdmin = member._id === chat.groupAdmin?._id;

                                return (
                                    <div key={member._id} className="member-item">
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.username} className="avatar" />
                                        ) : (
                                            <div className="avatar-placeholder" style={{ background: avatar.bg }}>
                                                {avatar.text}
                                            </div>
                                        )}
                                        <div className="member-info">
                                            <h4>{member.username}</h4>
                                            <p className="text-muted">{member.email}</p>
                                        </div>
                                        {isMemberAdmin && (
                                            <span className="badge badge-primary">Admin</span>
                                        )}
                                        {isAdmin && member._id !== user._id && (
                                            <button
                                                className="btn btn-ghost"
                                                onClick={() => handleRemoveUser(member._id)}
                                            >
                                                <FiUserMinus size={18} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-error" onClick={handleLeaveGroup}>
                        <FiLogOut size={18} />
                        Leave Group
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupInfoModal;
