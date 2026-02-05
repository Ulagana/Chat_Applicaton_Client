import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        const result = await login(email, password);
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
                        <FiLogIn size={32} />
                    </div>
                    <h1>Welcome Back</h1>
                    <p className="text-secondary">Sign in to continue chatting</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

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
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Signing in...
                            </>
                        ) : (
                            <>
                                <FiLogIn size={18} />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p className="text-secondary">
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
