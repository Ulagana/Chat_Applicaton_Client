import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { authAPI, chatAPI } from '../utils/api';
import { FiX, FiSearch, FiUserPlus } from 'react-icons/fi';
import { generateAvatar } from '../utils/helpers';
import './Modal.css';

const GroupChatModal = ({ onClose, fetchChats }) => {
    const [groupName, setGroupName] = useState('');
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setSelectedChat } = useChat();

    const handleSearch = async (query) => {
        setSearch(query);

        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const { data } = await authAPI.searchUsers(query);
            setSearchResults(data);
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const handleSelectUser = (user) => {
        if (selectedUsers.find(u => u._id === user._id)) {
            setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedUsers.length < 2) {
            alert('Please enter a group name and select at least 2 users');
            return;
        }

        setLoading(true);
        try {
            const userIds = selectedUsers.map(u => u._id);
            const { data } = await chatAPI.createGroup(groupName, userIds);
            setSelectedChat(data);
            fetchChats();
            onClose();
        } catch (error) {
            console.error('Failed to create group:', error);
            alert(error.response?.data?.message || 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create Group Chat</h2>
                    <button className="btn btn-ghost" onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="input-group">
                        <label className="input-label">Group Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Enter group name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Add Users (min 2)</label>
                        <div className="search-input-wrapper">
                            <FiSearch size={18} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {selectedUsers.length > 0 && (
                        <div className="selected-users">
                            {selectedUsers.map((user) => {
                                const avatar = generateAvatar(user.username);
                                return (
                                    <div key={user._id} className="selected-user-badge">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.username} className="avatar avatar-sm" />
                                        ) : (
                                            <div className="avatar-placeholder avatar-sm" style={{ background: avatar.bg }}>
                                                {avatar.text}
                                            </div>
                                        )}
                                        <span>{user.username}</span>
                                        <button onClick={() => handleSelectUser(user)}>
                                            <FiX size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="search-results">
                        {searchResults.map((user) => {
                            const avatar = generateAvatar(user.username);
                            const isSelected = selectedUsers.find(u => u._id === user._id);

                            return (
                                <div
                                    key={user._id}
                                    className={`user-item ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleSelectUser(user)}
                                >
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.username} className="avatar" />
                                    ) : (
                                        <div className="avatar-placeholder" style={{ background: avatar.bg }}>
                                            {avatar.text}
                                        </div>
                                    )}
                                    <div className="user-info">
                                        <h4>{user.username}</h4>
                                        <p className="text-muted">{user.email}</p>
                                    </div>
                                    {isSelected && <FiUserPlus size={20} className="text-success" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleCreateGroup}
                        disabled={loading || !groupName.trim() || selectedUsers.length < 2}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Creating...
                            </>
                        ) : (
                            'Create Group'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupChatModal;
