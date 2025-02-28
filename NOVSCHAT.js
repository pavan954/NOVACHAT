const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

fs.writeFileSync(
  path.join(publicDir, 'index.html'),
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NOVA Chat</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="login-container" id="login-container">
    <div class="login-card">
      <h1>Welcome to NOVA Chat</h1>
      <p>Please enter a username to join the chat</p>
      
      <form id="login-form">
        <input 
          type="text" 
          id="username-input" 
          placeholder="Enter your username" 
          minlength="3" 
          maxlength="15" 
          pattern="[A-Za-z0-9_]+" 
          title="Username can only contain letters, numbers, and underscores"
          required
        >
        <div class="error-message" id="error-message"></div>
        <button type="submit">Join Chat</button>
      </form>
    </div>
  </div>

  <div class="chat-container" id="chat-container" style="display: none;">
    <header class="chat-header">
      <h1>NOVA Chat</h1>
      <div id="connection-status" class="status connecting">Connecting...</div>
    </header>
    
    <div class="users-sidebar">
      <h3>Online Users</h3>
      <ul id="users-list"></ul>
    </div>
    
    <div class="chat-main">
      <div class="chat-messages" id="chat-messages"></div>
      
      <form id="message-form" class="message-form">
        <div class="message-input-container">
          <div class="recipient-label" id="recipient-label">To: Everyone</div>
          <input
            type="text"
            id="message-input"
            placeholder="Type your message..."
            autocomplete="off"
            required
          />
        </div>
        <button type="submit">Send</button>
      </form>
    </div>
  </div>

  <script src="client.js"></script>
</body>
</html>`
);

fs.writeFileSync(
  path.join(publicDir, 'styles.css'),
  `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --primary-color: #2c3e50;
  --primary-light: #34495e;
  --primary-dark: #1a2530;
  --accent-color: #3498db;
  --accent-hover: #2980b9;
  --success-color: #2ecc71;
  --warning-color: #f39c12;
  --error-color: #e74c3c;
  --light-gray: #f5f5f5;
  --medium-gray: #e0e0e0;
  --dark-gray: #95a5a6;
  --text-primary: #2c3e50;
  --text-secondary: #7f8c8d;
  --border-radius: 8px;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --transition: all 0.25s ease;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: var(--light-gray);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-primary);
}

/* Login Screen */
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--light-gray);
}

.login-card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 40px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.login-card h1 {
  color: var(--primary-color);
  margin-bottom: 12px;
  font-weight: 600;
}

.login-card p {
  color: var(--text-secondary);
  margin-bottom: 30px;
  font-size: 0.95rem;
}

#login-form {
  display: flex;
  flex-direction: column;
}

#username-input {
  padding: 12px 16px;
  border: 1px solid var(--medium-gray);
  border-radius: var(--border-radius);
  font-size: 16px;
  margin-bottom: 5px;
  transition: var(--transition);
}

#username-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.error-message {
  color: var(--error-color);
  font-size: 14px;
  min-height: 20px;
  margin-bottom: 15px;
  text-align: left;
}

#login-form button {
  padding: 12px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

#login-form button:hover {
  background-color: var(--accent-hover);
}

/* Chat Container */
.chat-container {
  max-width: 1200px;
  width: 90%;
  height: 85vh;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background-color: var(--primary-color);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.status::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.connecting {
  background-color: var(--warning-color);
  color: #fff;
}

.connecting::before {
  background-color: #fff;
}

.connected {
  background-color: var(--success-color);
  color: #fff;
}

.connected::before {
  background-color: #fff;
}

.disconnected {
  background-color: var(--error-color);
  color: #fff;
}

.disconnected::before {
  background-color: #fff;
}

.chat-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.users-sidebar {
  width: 220px;
  background-color: #fafafa;
  border-right: 1px solid var(--medium-gray);
  padding: 20px;
  overflow-y: auto;
}

.users-sidebar h3 {
  margin-bottom: 15px;
  color: var(--primary-color);
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.users-sidebar h3::before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: var(--success-color);
  border-radius: 50%;
  margin-right: 8px;
}

#users-list {
  list-style: none;
}

#users-list li {
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.95rem;
}

#users-list li:hover {
  background-color: rgba(52, 152, 219, 0.1);
}

#users-list li.selected {
  background-color: rgba(52, 152, 219, 0.2);
  font-weight: 500;
}

#users-list li.current-user {
  font-style: italic;
  color: var(--text-secondary);
}

#users-list li.everyone {
  background-color: var(--primary-color);
  color: white;
}

@media (min-width: 768px) {
  .chat-container {
    flex-direction: row;
  }
  
  .chat-header {
    position: absolute;
    width: 100%;
    z-index: 1;
  }
  
  .users-sidebar {
    margin-top: 60px;
    height: calc(100% - 60px);
  }
  
  .chat-main {
    margin-top: 60px;
    height: calc(100% - 60px);
    flex: 1;
  }
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #fcfcfc;
}

.message {
  margin-bottom: 18px;
  padding: 12px 16px;
  border-radius: var(--border-radius);
  max-width: 70%;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message .sender {
  font-weight: 600;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.message .timestamp {
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-top: 5px;
  text-align: right;
}

.message.system {
  background-color: #f8f9fa;
  color: var(--text-secondary);
  text-align: center;
  margin: 10px auto;
  font-style: italic;
  border: 1px dashed var(--medium-gray);
  box-shadow: none;
}

.message.received {
  background-color: #f1f8fe;
  margin-right: auto;
  border-bottom-left-radius: 4px;
}

.message.sent {
  background-color: #eefbf3;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.message.private {
  background-color: #fff3f8;
  border-left: 3px solid var(--error-color);
}

.message.private-sent {
  background-color: #ffebf3;
  margin-left: auto;
  border-right: 3px solid var(--error-color);
}

.private-indicator {
  font-size: 0.75rem;
  font-style: italic;
  color: var(--error-color);
  margin-bottom: 3px;
  display: flex;
  align-items: center;
}

.private-indicator::before {
  content: '•';
  margin-right: 4px;
  font-size: 1.2rem;
}

.message-form {
  display: flex;
  padding: 16px 20px;
  background-color: white;
  border-top: 1px solid var(--medium-gray);
}

.message-input-container {
  position: relative;
  flex: 1;
}

.recipient-label {
  position: absolute;
  top: -22px;
  left: 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.message-form input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--medium-gray);
  border-radius: var(--border-radius);
  outline: none;
  transition: var(--transition);
  font-size: 0.95rem;
}

.message-form input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.message-form button {
  margin-left: 12px;
  padding: 10px 20px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
}

.message-form button:hover {
  background-color: var(--accent-hover);
}

@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
    width: 95%;
    height: 90vh;
    margin: 20px auto;
  }
  
  .users-sidebar {
    width: 100%;
    max-height: 120px;
    border-right: none;
    border-bottom: 1px solid var(--medium-gray);
    margin-top: 60px;
  }
  
  .chat-main {
    margin-top: 0;
  }
  
  .message {
    max-width: 85%;
  }
}

/* Add scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: var(--dark-gray);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}`
);

fs.writeFileSync(
  path.join(publicDir, 'client.js'),
  `document.addEventListener('DOMContentLoaded', () => {
  const loginContainer = document.getElementById('login-container');
  const loginForm = document.getElementById('login-form');
  const usernameInput = document.getElementById('username-input');
  const errorMessage = document.getElementById('error-message');
  const chatContainer = document.getElementById('chat-container');
  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('message-input');
  const messagesContainer = document.getElementById('chat-messages');
  const connectionStatus = document.getElementById('connection-status');
  const usersList = document.getElementById('users-list');
  const recipientLabel = document.getElementById('recipient-label');
  
  let socket;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let currentUsername = null;
  let selectedRecipient = 'everyone';
  let onlineUsers = [];
  
  const conversations = {
    'everyone': []
  };
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = \`\${protocol}//\${window.location.host}\`;
  
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    
    if (username.length < 3) {
      errorMessage.textContent = 'Username must be at least 3 characters long';
      return;
    }
    
    if (!username.match(/^[A-Za-z0-9_]+$/)) {
      errorMessage.textContent = 'Username can only contain letters, numbers, and underscores';
      return;
    }
    
    currentUsername = username;
    loginContainer.style.display = 'none';
    chatContainer.style.display = 'flex';
    
    connectWebSocket();
  });
  
  function connectWebSocket() {
    socket = new WebSocket(wsUrl);
    
    socket.addEventListener('open', (event) => {
      connectionStatus.textContent = 'Connected';
      connectionStatus.className = 'status connected';
      messageInput.disabled = false;
      reconnectAttempts = 0;
      
      socket.send(JSON.stringify({
        type: 'setUsername',
        username: currentUsername
      }));
    });
    
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'userList') {
        updateUsersList(message.users);
      } else if (message.type === 'chatHistory') {
        // Handle chat history from server
        handleChatHistory(message.history);
      } else {
        storeMessage(message);
        refreshMessages();
      }
    });
    
    socket.addEventListener('close', (event) => {
      connectionStatus.textContent = 'Disconnected. Reconnecting...';
      connectionStatus.className = 'status disconnected';
      messageInput.disabled = true;
      
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        setTimeout(connectWebSocket, delay);
      } else {
        connectionStatus.textContent = 'Connection failed. Please refresh the page.';
      }
    });
    
    socket.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
      connectionStatus.textContent = 'Connection Error';
      connectionStatus.className = 'status disconnected';
    });
  }
  
  function handleChatHistory(history) {
    // Clear conversations to reload with server data
    for (const key in conversations) {
      conversations[key] = [];
    }
    
    // Process and store all messages from history
    if (history.publicMessages) {
      history.publicMessages.forEach(msg => {
        conversations['everyone'].push(msg);
      });
    }
    
    if (history.privateMessages) {
      Object.keys(history.privateMessages).forEach(userId => {
        if (!conversations[userId]) {
          conversations[userId] = [];
        }
        
        history.privateMessages[userId].forEach(msg => {
          conversations[userId].push(msg);
        });
      });
    }
    
    refreshMessages();
  }
  
  function updateUsersList(users) {
    onlineUsers = users;
    usersList.innerHTML = '';
    
    const everyoneItem = document.createElement('li');
    everyoneItem.textContent = 'Everyone';
    everyoneItem.className = selectedRecipient === 'everyone' ? 'everyone selected' : 'everyone';
    everyoneItem.dataset.userId = 'everyone';
    usersList.appendChild(everyoneItem);
    
    users.forEach(user => {
      const userItem = document.createElement('li');
      userItem.textContent = user.username;
      
      if (user.id === currentUsername) {
        userItem.classList.add('current-user');
        userItem.textContent += ' (You)';
      }
      
      if (user.id === selectedRecipient) {
        userItem.classList.add('selected');
      }
      
      if (!conversations[user.id]) {
        conversations[user.id] = [];
      }
      
      userItem.dataset.userId = user.id;
      usersList.appendChild(userItem);
    });
    
    document.querySelectorAll('#users-list li').forEach(item => {
      item.addEventListener('click', function() {
        document.querySelectorAll('#users-list li').forEach(li => li.classList.remove('selected'));
        this.classList.add('selected');
        selectedRecipient = this.dataset.userId;
        
        if (selectedRecipient === 'everyone') {
          recipientLabel.textContent = 'To: Everyone';
        } else {
          const recipientUser = onlineUsers.find(user => user.id === selectedRecipient);
          const recipientName = recipientUser ? recipientUser.username : selectedRecipient;
          recipientLabel.textContent = \`To: \${recipientName}\`;
        }
        
        refreshMessages();
      });
    });
  }
  
  function storeMessage(message) {
    if (message.type === 'system') {
      conversations['everyone'].push(message);
    } else if (message.isPrivate) {
      const otherUserId = message.sender === currentUsername ? message.recipient : message.sender;
      
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = [];
      }
      
      conversations[otherUserId].push(message);
    } else {
      conversations['everyone'].push(message);
    }
  }
  
  function refreshMessages() {
    messagesContainer.innerHTML = '';
    
    const messages = conversations[selectedRecipient] || [];
    
    let messagesToDisplay = [...messages];
    if (selectedRecipient !== 'everyone') {
      messagesToDisplay = [...messagesToDisplay, ...conversations['everyone'].filter(m => m.type === 'system')];
      
      messagesToDisplay.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
    
    messagesToDisplay.forEach(message => {
      displayMessage(message);
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  function displayMessage(message) {
    const messageElement = document.createElement('div');
    
    if (message.type === 'system') {
      messageElement.className = 'message system';
      messageElement.innerHTML = \`
        <div class="content">\${escapeHtml(message.content)}</div>
        <div class="timestamp">\${formatTimestamp(message.timestamp)}</div>
      \`;
    } else {
      const isOwnMessage = message.sender === currentUsername;
      
      if (message.isPrivate) {
        if (isOwnMessage) {
          messageElement.className = 'message private-sent';
          
          const recipientUser = onlineUsers.find(user => user.id === message.recipient);
          const recipientName = recipientUser ? recipientUser.username : message.recipient;
          
          messageElement.innerHTML = \`
            <div class="private-indicator">Private to \${escapeHtml(recipientName)}</div>
            <div class="sender">You</div>
            <div class="content">\${escapeHtml(message.content)}</div>
            <div class="timestamp">\${formatTimestamp(message.timestamp)}</div>
          \`;
        } else {
          messageElement.className = 'message private received';
          
          const senderUser = onlineUsers.find(user => user.id === message.sender);
          const senderName = senderUser ? senderUser.username : message.sender;
          
          messageElement.innerHTML = \`
            <div class="private-indicator">Private from \${escapeHtml(senderName)}</div>
            <div class="sender">\${escapeHtml(senderName)}</div>
            <div class="content">\${escapeHtml(message.content)}</div>
            <div class="timestamp">\${formatTimestamp(message.timestamp)}</div>
          \`;
        }
      } else {
        messageElement.className = \`message \${isOwnMessage ? 'sent' : 'received'}\`;
        
        const senderUser = onlineUsers.find(user => user.id === message.sender);
        const senderName = senderUser ? senderUser.username : message.sender;
        
        messageElement.innerHTML = \`
          <div class="sender">\${isOwnMessage ? 'You' : escapeHtml(senderName)}</div>
          <div class="content">\${escapeHtml(message.content)}</div>
          <div class="timestamp">\${formatTimestamp(message.timestamp)}</div>
        \`;
      }
    }
    
    messagesContainer.appendChild(messageElement);
  }
  
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const message = messageInput.value.trim();
    if (!message) return;
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'message',
        content: message,
        recipient: selectedRecipient === 'everyone' ? null : selectedRecipient
      }));
      
      messageInput.value = '';
    }
  });
});`
);

app.use(express.static(publicDir));

const wss = new WebSocket.Server({ server });

const clients = new Map();

// Store messages persistently in memory
const messageHistory = {
  public: [], // Store all public messages
  private: {} // Store private messages by user pairs
};

// Helper function to get a key for private messages between two users
function getPrivateKey(user1, user2) {
  return [user1, user2].sort().join(':');
}

wss.on('connection', (ws) => {
  const tempId = `user_${Math.floor(Math.random() * 10000)}`;
  let clientInfo = { id: tempId, username: tempId, ws };
  clients.set(ws, clientInfo);
  
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      
      if (parsedMessage.type === 'setUsername') {
        const username = parsedMessage.username;
        
        let usernameTaken = false;
        for (const [, client] of clients.entries()) {
          if (client.username === username && client.ws !== ws) {
            usernameTaken = true;
            break;
          }
        }
        
        if (usernameTaken) {
          ws.send(JSON.stringify({
            type: 'system',
            content: `Username "${username}" is already taken. Please refresh and choose another username.`,
            sender: 'System',
            timestamp: new Date().toISOString()
          }));
          return;
        }
        
        clientInfo.username = username;
        clientInfo.id = username;
        clients.set(ws, clientInfo);
        
        // Send welcome message
        const welcomeMessage = {
          type: 'system',
          content: `Welcome to the chat, ${username}!`,
          sender: 'System',
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(welcomeMessage));
        
        // Store join message in history
        const joinMessage = {
          type: 'system',
          content: `${username} has joined the chat`,
          sender: 'System',
          timestamp: new Date().toISOString()
        };
        messageHistory.public.push(joinMessage);
        
        // Broadcast join message to all other clients
        broadcastMessage(joinMessage, ws);
        
        // Send chat history to the user
        sendChatHistoryToUser(ws, username);
        
        // Update user list for everyone
        sendUserList();
        
        return;
      }
      
      if (parsedMessage.type === 'message' || !parsedMessage.type) {
        if (parsedMessage.recipient) {
          sendPrivateMessage(clientInfo.id, parsedMessage.recipient, parsedMessage.content);
        } else {
          const messageToSend = {
            type: 'message',
            content: parsedMessage.content,
            sender: clientInfo.id,
            timestamp: new Date().toISOString()
          };
          
          // Store message in history
          messageHistory.public.push(messageToSend);
          
          // Broadcast to all clients
          broadcastMessage(messageToSend);
        }
      }
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  });
  
  ws.on('close', () => {
    const username = clients.get(ws)?.username || tempId;
    
    const leaveMessage = {
      type: 'system',
      content: `${username} has left the chat`,
      sender: 'System',
      timestamp: new Date().toISOString()
    };
    
    // Store leave message
    messageHistory.public.push(leaveMessage);
    
    // Broadcast leave message
    broadcastMessage(leaveMessage);
    
    clients.delete(ws);
    
    sendUserList();
  });
});

function sendChatHistoryToUser(ws, username) {
  // Prepare history object to send to the client
  const userHistory = {
    publicMessages: messageHistory.public,
    privateMessages: {}
  };
  
  // Add private messages where this user is involved
  Object.keys(messageHistory.private).forEach(key => {
    if (key.includes(username)) {
      const otherUser = key.split(':').find(u => u !== username);
      if (otherUser) {
        userHistory.privateMessages[otherUser] = messageHistory.private[key];
      }
    }
  });
  
  // Send history to user
  ws.send(JSON.stringify({
    type: 'chatHistory',
    history: userHistory
  }));
}

function sendPrivateMessage(senderId, recipientId, content) {
  const timestamp = new Date().toISOString();
  const messageObject = {
    type: 'message',
    content: content,
    sender: senderId,
    recipient: recipientId,
    isPrivate: true,
    timestamp: timestamp
  };
  
  // Store private message in history
  const privateKey = getPrivateKey(senderId, recipientId);
  if (!messageHistory.private[privateKey]) {
    messageHistory.private[privateKey] = [];
  }
  messageHistory.private[privateKey].push(messageObject);
  
  let recipientFound = false;
  clients.forEach(({id, ws}) => {
    if (id === recipientId) {
      ws.send(JSON.stringify(messageObject));
      recipientFound = true;
    }
    
    if (id === senderId) {
      ws.send(JSON.stringify(messageObject));
    }
  });
  
  if (!recipientFound) {
    const senderWs = findClientWsByUserId(senderId);
    if (senderWs) {
      const notificationMessage = {
        type: 'system',
        content: `User ${recipientId} is not available. Message has been saved and will be delivered when they reconnect.`,
        sender: 'System',
        timestamp: new Date().toISOString()
      };
      
      senderWs.send(JSON.stringify(notificationMessage));
    }
  }
}

function findClientWsByUserId(userId) {
  for (const [ws, clientInfo] of clients.entries()) {
    if (clientInfo.id === userId) {
      return ws;
    }
  }
  return null;
}

function sendUserList() {
  const userList = Array.from(clients.values()).map(client => ({
    id: client.id,
    username: client.username
  }));
  
  const userListMessage = {
    type: 'userList',
    users: userList
  };
  
  clients.forEach(({ws}) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(userListMessage));
    }
  });
}

function broadcastMessage(message, excludeClient = null) {
  const messageStr = JSON.stringify(message);
  clients.forEach(({ws}) => {
    if (ws !== excludeClient && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}

// Create package.json if it doesn't exist
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  fs.writeFileSync(packageJsonPath, JSON.stringify({
    "name": "websocket-chat",
    "version": "1.0.0",
    "description": "WebSocket chat application with custom usernames and private messaging",
    "main": "server.js",
    "scripts": {
      "start": "node server.js"
    },
    "engines": {
      "node": ">=14"
    },
    "dependencies": {
      "express": "^4.18.2",
      "ws": "^8.16.0"
    }
  }, null, 2));
}

// Use the PORT environment variable that Render will provide
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
