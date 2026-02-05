import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatPage from './pages/ChatPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <span className="spinner" style={{ width: '40px', height: '40px' }}></span>
                <p>Loading...</p>
            </div>
        );
    }

    return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to chat if already logged in)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <span className="spinner" style={{ width: '40px', height: '40px' }}></span>
                <p>Loading...</p>
            </div>
        );
    }

    return user ? <Navigate to="/chat" /> : children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <ChatProvider>
                    <SocketProvider>
                        <Routes>
                            <Route
                                path="/login"
                                element={
                                    <PublicRoute>
                                        <Login />
                                    </PublicRoute>
                                }
                            />
                            <Route
                                path="/register"
                                element={
                                    <PublicRoute>
                                        <Register />
                                    </PublicRoute>
                                }
                            />
                            <Route
                                path="/chat"
                                element={
                                    <ProtectedRoute>
                                        <ChatPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/" element={<Navigate to="/chat" />} />
                        </Routes>
                    </SocketProvider>
                </ChatProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
