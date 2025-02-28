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
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}
.login-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}
.login-card h1 {
  color: #4a69bd;
  margin-bottom: 10px;
}
.login-card p {
  color: #666;
  margin-bottom: 30px;
}
#login-form {
  display: flex;
  flex-direction: column;
}
#username-input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  margin-bottom: 5px;
}
.error-message {
  color: #eb4d4b;
  font-size: 14px;
  min-height: 20px;
  margin-bottom: 15px;
  text-align: left;
}
#login-form button {
  padding: 12px;
  background-color: #4a69bd;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}
#login-form button:hover {
  background-color: #3a58a7;
}
.chat-container {
  max-width: 1000px;
  width: 90%;
  height: 80vh;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-header {
  background-color: #4a69bd;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-header h1 {
  font-size: 1.5rem;
}
.status {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}
.connecting {
  background-color: #f9ca24;
  color: #333;
}
.connected {
  background-color: #6ab04c;
}
.disconnected {
  background-color: #eb4d4b;
}
.chat-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}
.users-sidebar {
  width: 200px;
  background-color: #f1f1f1;
  border-right: 1px solid #ddd;
  padding: 15px;
  overflow-y: auto;
}
.users-sidebar h3 {
  margin-bottom: 10px;
  color: #333;
}
#users-list {
  list-style: none;
}
#users-list li {
  padding: 8px 10px;
  margin-bottom: 5px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}
#users-list li:hover {
  background-color: #e0e0e0;
}
#users-list li.selected {
  background-color: #ddeeff;
  font-weight: bold;
}
#users-list li.current-user {
  font-style: italic;
  color: #666;
}
#users-list li.everyone {
  background-color: #4a69bd;
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
  padding: 15px;
  overflow-y: auto;
}
.message {
  margin-bottom: 15px;
  padding: 10px 15px;
  border-radius: 5px;
  max-width: 70%;
  word-wrap: break-word;
}
.message .sender {
  font-weight: bold;
  margin-bottom: 5px;
}
.message .timestamp {
  font-size: 0.7rem;
  color: #888;
  margin-top: 5px;
  text-align: right;
}
.message.system {
  background-color: #f1f1f1;
  color: #666;
  text-align: center;
  margin: 10px auto;
  font-style: italic;
}
.message.received {
  background-color: #e3f2fd;
  margin-right: auto;
}
.message.sent {
  background-color: #e2f8e5;
  margin-left: auto;
}
.message.private {
  background-color: #fce4ec;
}
.message.private-sent {
  background-color: #f8bbd0;
  margin-left: auto;
}
.private-indicator {
  font-size: 0.7rem;
  font-style: italic;
  color: #d81b60;
  margin-bottom: 3px;
}
.message-form {
  display: flex;
  padding: 15px;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
}
.message-input-container {
  position: relative;
  flex: 1;
}
.recipient-label {
  position: absolute;
  top: -20px;
  left: 0;
  font-size: 0.8rem;
  color: #555;
  font-weight: bold;
}
.message-form input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;
}
.message-form button {
  margin-left: 10px;
  padding: 10px 15px;
  background-color: #4a69bd;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.message-form button:hover {
  background-color: #3a58a7;
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
    border-bottom: 1px solid #ddd;
    margin-top: 60px;
  }
  .chat-main {
    margin-top: 0;
  }
  .message {
    max-width: 85%;
  }
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
        
        ws.send(JSON.stringify({
          type: 'system',
          content: `Welcome to the chat, ${username}!`,
          sender: 'System',
          timestamp: new Date().toISOString()
        }));
        
        broadcastMessage({
          type: 'system',
          content: `${username} has joined the chat`,
          sender: 'System',
          timestamp: new Date().toISOString()
        }, ws);
        
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
          
          broadcastMessage(messageToSend);
        }
      }
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  });
  
  ws.on('close', () => {
    const username = clients.get(ws)?.username || tempId;
    
    broadcastMessage({
      type: 'system',
      content: `${username} has left the chat`,
      sender: 'System',
      timestamp: new Date().toISOString()
    });
    
    clients.delete(ws);
    
    sendUserList();
  });
});

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
      senderWs.send(JSON.stringify({
        type: 'system',
        content: `User ${recipientId} is not available. Message could not be delivered.`,
        sender: 'System',
        timestamp: new Date().toISOString()
      }));
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