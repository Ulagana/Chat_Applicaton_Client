# Chat Application - Frontend

A modern, real-time chat application built with React, Socket.io, and a premium dark theme UI.

## Features

✨ **Modern UI Design**
- Glassmorphism effects and smooth animations
- Vibrant dark theme with gradient accents
- Fully responsive design for mobile and desktop

🔐 **Authentication**
- User registration and login
- JWT token-based authentication
- Protected routes

💬 **Real-time Chat**
- Instant messaging with Socket.io
- Typing indicators
- Message history
- 1-on-1 conversations

👥 **Group Chats**
- Create group conversations
- Add/remove members (admin only)
- Rename groups (admin only)
- Leave groups

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Icons** - Icon library

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 5000

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env` file in the root directory (or use the existing one):
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
client/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ChatList.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── GroupChatModal.jsx
│   │   ├── GroupInfoModal.jsx
│   │   ├── Message.jsx
│   │   ├── Sidebar.jsx
│   │   └── UserSearchModal.jsx
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── ChatContext.jsx
│   │   └── SocketContext.jsx
│   ├── pages/               # Page components
│   │   ├── ChatPage.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── utils/               # Utility functions
│   │   ├── api.js
│   │   └── helpers.js
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Usage

### Register a New Account

1. Click "Sign up" on the login page
2. Fill in username, email, and password
3. Optionally add an avatar URL
4. Click "Sign Up"

### Start a Chat

1. Click "New Chat" button
2. Search for a user by name or email
3. Click on a user to start chatting

### Create a Group

1. Click "New Group" button
2. Enter a group name
3. Search and select at least 2 users
4. Click "Create Group"

### Send Messages

1. Select a chat from the sidebar
2. Type your message in the input field
3. Press Enter or click the send button

## Features in Detail

### Real-time Messaging
- Messages are delivered instantly using Socket.io
- See when someone is typing
- Automatic scroll to latest message

### Group Management
- **Admin privileges:** The creator of a group is the admin
- **Add members:** Admins can add new users to the group
- **Remove members:** Admins can remove users from the group
- **Rename group:** Admins can change the group name
- **Leave group:** Any member can leave the group

### UI/UX
- **Glassmorphism:** Modern glass-like UI elements
- **Smooth animations:** Fade-in, slide-in effects
- **Responsive design:** Works on mobile, tablet, and desktop
- **Dark theme:** Easy on the eyes with vibrant accents
- **Loading states:** Visual feedback for all async operations

## Troubleshooting

### Cannot connect to backend

Make sure:
1. Backend server is running on port 5000
2. `.env` file has correct API URL
3. CORS is enabled on the backend

### Messages not appearing in real-time

Check:
1. Socket.io connection is established (check browser console)
2. Backend Socket.io server is running
3. No firewall blocking WebSocket connections

## License

MIT
