import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiUserPlus, FiImage, FiUpload, FiX } from 'react-icons/fi';
import './Auth.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatar, setAvatar] = useState('');
    const [avatarPreview, setAvatarPreview] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
                setAvatar(reader.result); // Store base64 for now
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCancel = () => {
        navigate('/login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        const result = await register(username, email, password, avatar);
        setLoading(false);

        if (result.success) {
            navigate('/chat');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-card fade-in">
                <div className="auth-header">
                    <div className="auth-icon">
                        <FiUserPlus size={32} />
                    </div>
                    <h1>Create Account</h1>
                    <p className="text-secondary">Join and start chatting</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label">
                            <FiUser size={16} /> Username
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <FiMail size={16} /> Email
                        </label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <FiLock size={16} /> Password
                        </label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <FiLock size={16} /> Confirm Password
                        </label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <FiImage size={16} /> Avatar (Optional)
                        </label>
                        <div className="avatar-upload-container">
                            {avatarPreview && (
                                <div className="avatar-preview">
                                    <img src={avatarPreview} alt="Avatar preview" />
                                    <button
                                        type="button"
                                        className="avatar-remove"
                                        onClick={() => {
                                            setAvatar('');
                                            setAvatarPreview('');
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="btn btn-secondary w-full"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                            >
                                <FiUpload size={18} />
                                {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
                            </button>
                        </div>
                    </div>

                    <div className="button-group">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            <FiX size={18} />
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    <FiUserPlus size={18} />
                                    Sign Up
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="auth-footer">
                    <p className="text-secondary">
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
