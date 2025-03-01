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
  /* 2025 Color Palette - Refined with variable opacity support */
  --primary-color: #2563eb;
  --primary-light: rgba(37, 99, 235, 0.15);
  --primary-dark: #1e40af;
  --accent-color: #8b5cf6;
  --accent-hover: #7c3aed;
  --success-color: #059669;
  --warning-color: #d97706;
  --error-color: #dc2626;
  --surface-1: #ffffff;
  --surface-2: #f8fafc;
  --surface-3: #f1f5f9;
  --border-color: rgba(226, 232, 240, 0.8);
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #64748b;
  
  /* Modern 2025 UX Variables */
  --border-radius-sm: 6px;
  --border-radius-md: 12px;
  --border-radius-lg: 16px;
  --border-radius-xl: 24px;
  --shadow-ambient: 0px 2px 8px rgba(0, 0, 0, 0.05);
  --shadow-elevated: 0px 8px 24px rgba(0, 0, 0, 0.08);
  --shadow-floating: 0px 16px 48px rgba(0, 0, 0, 0.12);
  --transition-fast: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Typography */
  --font-sans: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
}

body {
  font-family: var(--font-sans);
  background: linear-gradient(150deg, #f8fafc 0%, #eef2ff 100%);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Login Screen - Layered 3D effect with subdued shadows */
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(150deg, #f8fafc 0%, #eef2ff 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, var(--primary-light) 0%, rgba(238, 242, 255, 0) 70%);
  top: -400px;
  right: -200px;
  border-radius: 50%;
  z-index: 0;
}

.login-card {
  background-color: var(--surface-1);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-ambient);
  padding: 48px 40px;
  width: 90%;
  max-width: 440px;
  text-align: left;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
  z-index: 1;
}

.login-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
}

.login-card h1 {
  color: var(--text-primary);
  margin-bottom: 16px;
  font-weight: 700;
  font-size: 2.2rem;
  letter-spacing: -0.5px;
}

.login-card p {
  color: var(--text-secondary);
  margin-bottom: 32px;
  font-size: 1.05rem;
  line-height: 1.6;
}

#login-form {
  display: flex;
  flex-direction: column;
}

#username-input {
  padding: 16px 20px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: 16px;
  margin-bottom: 8px;
  transition: var(--transition-fast);
  background-color: var(--surface-2);
}

#username-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background-color: var(--surface-1);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.error-message {
  color: var(--error-color);
  font-size: 14px;
  min-height: 20px;
  margin-bottom: 18px;
  text-align: left;
}

#login-form button {
  padding: 16px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-smooth);
  text-transform: none;
  letter-spacing: 0.2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

#login-form button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevated);
}

#login-form button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-ambient);
}

/* Chat Container - Modern layered design */
.chat-container {
  max-width: 1400px;
  width: 90%;
  height: 85vh;
  background-color: var(--surface-1);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-ambient);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color);
  position: relative;
}

.chat-header {
  background: var(--surface-1);
  color: var(--text-primary);
  padding: 20px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.chat-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-header h1::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  border-radius: 4px;
  transform: rotate(45deg);
}

.status {
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.connecting {
  background-color: var(--warning-color);
  color: #fff;
}

.connected {
  background-color: var(--success-color);
  color: #fff;
}

.disconnected {
  background-color: var(--error-color);
  color: #fff;
}

.chat-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

/* Modern sidebar with improved information hierarchy */
.users-sidebar {
  width: 280px;
  background-color: var(--surface-2);
  border-right: 1px solid var(--border-color);
  padding: 24px;
  overflow-y: auto;
}

.users-sidebar h3 {
  margin-bottom: 24px;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-left: 12px;
}

.users-sidebar h3::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: var(--accent-color);
  border-radius: 50%;
  margin-right: 8px;
}

#users-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

#users-list li {
  padding: 14px 16px;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  position: relative;
  border-left: 2px solid transparent;
}

#users-list li:hover {
  background-color: var(--surface-3);
  border-left-color: var(--accent-color);
  transform: translateX(3px);
}

#users-list li.selected {
  background-color: var(--primary-light);
  font-weight: 600;
  border-left-color: var(--primary-color);
}

#users-list li.current-user {
  font-style: italic;
  color: var(--text-secondary);
}

#users-list li.everyone {
  background-color: var(--primary-dark);
  color: white;
  border-left-color: var(--primary-color);
}

/* Message activity indicator with subtle animation */
.activity-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: var(--success-color);
  border-radius: 50%;
  margin-right: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.has-activity .activity-indicator {
  opacity: 1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.6; transform: scale(0.8); }
}

@media (min-width: 768px) {
  .chat-container {
    flex-direction: row;
  }
  
  .chat-main {
    flex: 1;
  }
}

/* Modern message area with improved content layout */
.chat-messages {
  flex: 1;
  padding: 28px 32px;
  overflow-y: auto;
  background-color: var(--surface-1);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  margin-bottom: 8px;
  padding: 16px 20px;
  border-radius: var(--border-radius-lg);
  max-width: 75%;
  word-wrap: break-word;
  box-shadow: var(--shadow-ambient);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  animation: messageAppear 0.3s forwards;
  position: relative;
}

@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message:hover {
  box-shadow: var(--shadow-elevated);
  transform: translateY(-2px);
}

.message .sender {
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 0.95rem;
  color: var(--primary-dark);
  display: flex;
  align-items: center;
  gap: 6px;
}

.message .sender::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: var(--accent-color);
  border-radius: 50%;
}

.message .content {
  line-height: 1.5;
  font-size: 0.95rem;
  overflow-wrap: break-word;
}

.message .timestamp {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  margin-top: 8px;
  text-align: right;
}

.message.system {
  background-color: var(--surface-2);
  color: var(--text-secondary);
  text-align: center;
  margin: 15px auto;
  font-style: italic;
  border: 1px solid var(--border-color);
  box-shadow: none;
  max-width: 80%;
  font-size: 0.9rem;
}

.message.received {
  background: linear-gradient(135deg, var(--surface-2) 0%, var(--surface-3) 100%);
  margin-right: auto;
  border-left: 3px solid var(--primary-color);
}

.message.sent {
  background: linear-gradient(135deg, var(--primary-light) 0%, rgba(37, 99, 235, 0.05) 100%);
  margin-left: auto;
  border-right: 3px solid var(--primary-color);
}

.message.private {
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.05) 0%, rgba(217, 119, 6, 0.1) 100%);
  border-left: 3px solid var(--warning-color);
}

.message.private-sent {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(220, 38, 38, 0.1) 100%);
  margin-left: auto;
  border-right: 3px solid var(--error-color);
}

.private-indicator {
  font-size: 0.75rem;
  font-weight: 600;
  font-style: italic;
  color: var(--error-color);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.private-indicator::before {
  content: '•';
  margin-right: 4px;
  font-size: 1.2rem;
}

/* Modern message form with improved interactions */
.message-form {
  display: flex;
  padding: 24px 32px;
  background-color: var(--surface-2);
  border-top: 1px solid var(--border-color);
  gap: 16px;
}

.message-input-container {
  position: relative;
  flex: 1;
}

.recipient-label {
  position: absolute;
  top: -24px;
  left: 4px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.recipient-label::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: var(--primary-color);
  border-radius: 50%;
}

.message-form input {
  width: 100%;
  padding: 16px 20px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  outline: none;
  transition: var(--transition-fast);
  font-size: 0.95rem;
  background-color: var(--surface-1);
}

.message-form input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

/* Modern button styling with micro-interactions */
.message-form button {
  padding: 14px 28px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.message-form button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevated);
}

.message-form button:active {
  transform: translateY(0);
}

/* Modern send icon for enhanced UX */
.message-form button::before {
  content: '';
  display: inline-block;
  width: 18px;
  height: 18px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M3.5 18.66l10.5-10.5-10.5 3.5V5.33l16.8 7-16.8 7z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
    width: 95%;
    height: 92vh;
    margin: 16px auto;
  }
  
  .users-sidebar {
    width: 100%;
    max-height: 180px;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
  
  .message {
    max-width: 85%;
  }
  
  .message-form {
    padding: 20px;
  }
  
  .message-form button {
    padding: 14px 20px;
  }
}

/* Modern scrollbar with subtle styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--surface-2);
  border-radius: 100px;
}

::-webkit-scrollbar-thumb {
  background: var(--text-tertiary);
  border-radius: 100px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

/* Enhanced layout for desktop view with proper spacing */
@media (min-width: 1024px) {
  .chat-container {
    height: 84vh;
    max-height: 900px;
  }
  
  .users-sidebar {
    width: 320px;
  }
}

/* Print styles preserved for professional documents */
@media print {
  .chat-header, .users-sidebar, .message-form {
    display: none;
  }
  
  .chat-container {
    box-shadow: none;
    height: auto;
  }
  
  .chat-messages {
    overflow: visible;
  }
  
  .message {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid var(--border-color);
  }
}

/* Modern loading animation with subtle effect */
.loading {
  position: relative;
}

.loading::after {
  content: "";
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s ease-in-out infinite;
  margin-left: 8px;
  position: absolute;
  right: -28px;
  top: 50%;
  transform: translateY(-50%);
}

@keyframes spin {
  to { transform: translateY(-50%) rotate(360deg); }
}

/* Improved focus states for accessibility */
*:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 3px;
  border-radius: var(--border-radius-sm);
}

/* Enhanced typing indicator for real-time feedback */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 8px 0;
  padding: 8px 12px;
  background-color: var(--surface-2);
  border-radius: 100px;
  width: fit-content;
  font-size: 0.85rem;
  color: var(--text-secondary);
  opacity: 0.8;
  animation: fadeIn 0.3s forwards;
}

.typing-indicator::before {
  content: '';
  width: 8px;
  height: 8px;
  background-color: var(--accent-color);
  border-radius: 50%;
  display: inline-block;
}

.typing-dots {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-left: 4px;
}

.typing-dot {
  width: 6px;
  height: 6px;
  background-color: var(--text-tertiary);
  border-radius: 50%;
  animation: blink 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0% { opacity: 0.4; transform: scale(0.8); }
  20% { opacity: 1; transform: scale(1); }
  100% { opacity: 0.4; transform: scale(0.8); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Custom tooltip with modern styling */
[data-tooltip] {
  position: relative;
}

[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) scale(0.95);
  padding: 8px 12px;
  background-color: var(--text-primary);
  color: white;
  border-radius: var(--border-radius-md);
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: var(--shadow-elevated);
}

[data-tooltip]::before {
  content: '';
  position: absolute;
  bottom: calc(100% - 1px);
  left: 50%;
  transform: translateX(-50%) rotate(45deg) scale(0);
  width: 10px;
  height: 10px;
  background-color: var(--text-primary);
  z-index: 9;
  transition: all 0.2s ease;
  pointer-events: none;
}

[data-tooltip]:hover::after {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

[data-tooltip]:hover::before {
  transform: translateX(-50%) rotate(45deg) scale(1);
}

/* Reaction feature - modern UI element */
.message-reactions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.reaction {
  padding: 4px 8px;
  border-radius: 100px;
  background-color: var(--surface-2);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: var(--transition-fast);
  border: 1px solid var(--border-color);
}

.reaction:hover, .reaction.active {
  background-color: var(--primary-light);
  border-color: var(--primary-color);
}

.reaction.active {
  font-weight: 500;
}

.reaction-count {
  font-size: 0.85rem;
  font-weight: 500;
}

/* Thread view - modern nested conversation UI */
.thread-indicator {
  font-size: 0.8rem;
  color: var(--primary-color);
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  width: fit-content;
}

.thread-indicator:hover {
  text-decoration: underline;
}

.thread-indicator::before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232563eb'%3E%3Cpath d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16z'/%3E%3C/svg%3E");
  background-size: contain;
}

/* Modern connection status indicator at the bottom */
.connection-status {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background-color: var(--surface-1);
  border-radius: 100px;
  box-shadow: var(--shadow-floating);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  z-index: 100;
  border: 1px solid var(--border-color);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.connection-status.show {
  opacity: 1;
  pointer-events: all;
}

.connection-status.online::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: var(--success-color);
  border-radius: 50%;
}

.connection-status.offline::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: var(--error-color);
  border-radius: 50%;
}

.connection-status.reconnecting::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: var(--warning-color);
  border-radius: 50%;
  animation: pulse 1.5s infinite;
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
  // Store user activity status to track new messages
  let userActivity = {};
  
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
        if (message.type === 'message' && message.sender !== currentUsername) {
          // Mark the sender as having new activity
          updateUserActivity(message.sender);
        }
        
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
  
  function updateUserActivity(username) {
    if (username !== 'everyone' && username !== currentUsername) {
      userActivity[username] = true;
      updateUserActivityIndicators();
    }
  }
  
  function clearUserActivity(username) {
    if (userActivity[username]) {
      userActivity[username] = false;
      updateUserActivityIndicators();
    }
  }
  
  function updateUserActivityIndicators() {
    document.querySelectorAll('#users-list li').forEach(item => {
      const userId = item.dataset.userId;
      if (userId !== 'everyone' && userId !== currentUsername) {
        if (userActivity[userId]) {
          item.classList.add('has-activity');
        } else {
          item.classList.remove('has-activity');
        }
      }
    });
  }
  
  function handleChatHistory(history) {
    // Clear conversations to reload with server data
    for (const key in conversations) {
      if (key !== 'everyone') {
        delete conversations[key];
      } else {
        conversations[key] = [];
      }
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
      
      // Add activity indicator
      const activityIndicator = document.createElement('span');
      activityIndicator.className = 'activity-indicator';
      userItem.appendChild(activityIndicator);
      
      const userNameSpan = document.createElement('span');
      userNameSpan.textContent = user.username;
      userItem.appendChild(userNameSpan);
      
      if (user.id === currentUsername) {
        userItem.classList.add('current-user');
        userNameSpan.textContent += ' (You)';
      }
      
      if (user.id === selectedRecipient) {
        userItem.classList.add('selected');
      }
      
      // Apply activity status if applicable
      if (userActivity[user.id]) {
        userItem.classList.add('has-activity');
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
        
        // Clear activity indicator when selecting a user
        if (selectedRecipient !== 'everyone') {
          clearUserActivity(selectedRecipient);
        }
        
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
  private: {}, // Store private messages by user pairs
  privateMappings: {} // Map usernames to their private conversation pairs
};

// Helper function to get a key for private messages between two users
function getPrivateKey(user1, user2) {
  return [user1, user2].sort().join(':');
}

// Helper function to update the username mappings for private conversations
function updatePrivateMappings(username) {
  if (!messageHistory.privateMappings[username]) {
    messageHistory.privateMappings[username] = [];
  }
  
  // Find all private conversations involving this user
  Object.keys(messageHistory.private).forEach(key => {
    const users = key.split(':');
    if (users.includes(username)) {
      const otherUser = users.find(u => u !== username);
      if (otherUser && !messageHistory.privateMappings[username].includes(otherUser)) {
        messageHistory.privateMappings[username].push(otherUser);
      }
    }
  });
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
        
        // Update private message mappings for this user
        updatePrivateMappings(username);
        
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
        
        // Broadcast to all clients that a new user joined
        broadcastMessage(joinMessage);
        broadcastUserList();
        
        // Send chat history to the new user
        sendChatHistory(ws);
      } else if (parsedMessage.type === 'message') {
        const sender = clientInfo.username;
        const now = new Date().toISOString();
        
        if (parsedMessage.recipient) {
          // This is a private message
          let recipientWs = null;
          for (const [clientWs, client] of clients.entries()) {
            if (client.id === parsedMessage.recipient) {
              recipientWs = clientWs;
              break;
            }
          }
          
          const privateMessage = {
            type: 'message',
            content: parsedMessage.content,
            sender: sender,
            recipient: parsedMessage.recipient,
            isPrivate: true,
            timestamp: now
          };
          
          // Store private message in history
          const privateKey = getPrivateKey(sender, parsedMessage.recipient);
          if (!messageHistory.private[privateKey]) {
            messageHistory.private[privateKey] = [];
          }
          messageHistory.private[privateKey].push(privateMessage);
          
          // Update private mappings for both users
          updatePrivateMappings(sender);
          updatePrivateMappings(parsedMessage.recipient);
          
          // Send to recipient and sender
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify(privateMessage));
          }
          ws.send(JSON.stringify(privateMessage));
        } else {
          // This is a public message
          const publicMessage = {
            type: 'message',
            content: parsedMessage.content,
            sender: sender,
            isPrivate: false,
            timestamp: now
          };
          
          // Store in public message history
          messageHistory.public.push(publicMessage);
          
          // Broadcast to all clients
          broadcastMessage(publicMessage);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  ws.on('close', () => {
    const username = clientInfo.username;
    clients.delete(ws);
    
    const leaveMessage = {
      type: 'system',
      content: `${username} has left the chat`,
      sender: 'System',
      timestamp: new Date().toISOString()
    };
    
    messageHistory.public.push(leaveMessage);
    broadcastMessage(leaveMessage);
    broadcastUserList();
  });

  // Send initial user list to the client
  broadcastUserList();
});

// Function to send chat history to a new user
function sendChatHistory(ws) {
  const client = clients.get(ws);
  if (!client) return;
  
  const username = client.username;
  
  // Prepare public messages
  const publicMessages = [...messageHistory.public];
  
  // Prepare private messages for this user
  const privateMessages = {};
  const userMappings = messageHistory.privateMappings[username] || [];
  
  userMappings.forEach(otherUser => {
    privateMessages[otherUser] = [];
    const privateKey = getPrivateKey(username, otherUser);
    
    if (messageHistory.private[privateKey]) {
      privateMessages[otherUser] = messageHistory.private[privateKey];
    }
  });
  
  // Send history to client
  ws.send(JSON.stringify({
    type: 'chatHistory',
    history: {
      publicMessages,
      privateMessages
    }
  }));
}

// Function to broadcast user list to all clients
function broadcastUserList() {
  const userList = Array.from(clients.values()).map(client => ({
    id: client.id,
    username: client.username
  }));
  
  for (const [client, _] of clients.entries()) {
    client.send(JSON.stringify({
      type: 'userList',
      users: userList
    }));
  }
}

// Function to broadcast message to all clients
function broadcastMessage(message) {
  for (const [client, _] of clients.entries()) {
    client.send(JSON.stringify(message));
  }
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the chat`);
});
