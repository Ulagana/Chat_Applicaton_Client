import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { authAPI, chatAPI } from '../utils/api';
import { FiX, FiSearch } from 'react-icons/fi';
import { generateAvatar } from '../utils/helpers';
import './Modal.css';

const UserSearchModal = ({ onClose, fetchChats }) => {
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setSelectedChat } = useChat();

    const handleSearch = async (query) => {
        setSearch(query);

        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        try {
            const { data } = await authAPI.searchUsers(query);
            setSearchResults(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccessChat = async (userId) => {
        try {
            const { data } = await chatAPI.accessChat(userId);
            setSelectedChat(data);
            fetchChats();
            onClose();
        } catch (error) {
            console.error('Failed to access chat:', error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Search Users</h2>
                    <button className="btn btn-ghost" onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="search-input-wrapper">
                        <FiSearch size={18} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="search-results">
                        {loading ? (
                            <div className="loading-state">
                                <span className="spinner"></span>
                                <p>Searching...</p>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="empty-state">
                                <p className="text-muted">
                                    {search ? 'No users found' : 'Start typing to search'}
                                </p>
                            </div>
                        ) : (
                            searchResults.map((user) => {
                                const avatar = generateAvatar(user.username);
                                return (
                                    <div
                                        key={user._id}
                                        className="user-item"
                                        onClick={() => handleAccessChat(user._id)}
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
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSearchModal;
