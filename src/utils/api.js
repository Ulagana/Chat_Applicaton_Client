import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const { token } = JSON.parse(userInfo);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData) => api.post('/user/register', userData),
    login: (credentials) => api.post('/user/login', credentials),
    searchUsers: (search) => api.get(`/user?search=${search}`),
};

// Chat API
export const chatAPI = {
    accessChat: (userId) => api.post('/chat', { userId }),
    fetchChats: () => api.get('/chat'),
    createGroup: (name, users) => api.post('/chat/group', { name, users: JSON.stringify(users) }),
    renameGroup: (chatId, chatName) => api.put('/chat/rename', { chatId, chatName }),
    addToGroup: (chatId, userId) => api.put('/chat/groupadd', { chatId, userId }),
    removeFromGroup: (chatId, userId) => api.put('/chat/groupremove', { chatId, userId }),
};

// Message API
export const messageAPI = {
    sendMessage: (content, chatId) => api.post('/message', { content, chatId }),
    fetchMessages: (chatId) => api.get(`/message/${chatId}`),
    addReaction: (messageId, emoji) => api.post(`/message/${messageId}/reaction`, { emoji }),
    removeReaction: (messageId, emoji) => api.delete(`/message/${messageId}/reaction/${encodeURIComponent(emoji)}`),
};

// Upload API
export const uploadAPI = {
    uploadFile: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload/single', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default api;
