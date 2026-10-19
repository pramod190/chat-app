const joinForm = document.getElementById('join-form');
const usernameInput = document.getElementById('username');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');
const messages = document.getElementById('messages');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

let username = '';
let socket = null;

function setConnected(connected) {
  statusDot.classList.toggle('connected', connected);
  statusText.textContent = connected ? 'Connected' : 'Disconnected';
  messageInput.disabled = !connected;
  sendButton.disabled = !connected;
  usernameInput.disabled = connected;
  joinForm.querySelector('button').disabled = connected;
}

function addSystemMessage(text) {
  const item = document.createElement('li');
  item.className = 'system';
  item.textContent = text;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}

function addChatMessage(sender, text) {
  const item = document.createElement('li');
  item.className = 'chat';

  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = sender;

  const bubble = document.createElement('span');
  bubble.className = 'bubble';
  bubble.textContent = text;

  item.append(name, bubble);
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}

joinForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const requestedUsername = usernameInput.value.trim();

  if (!requestedUsername || socket?.readyState === WebSocket.OPEN) {
    return;
  }

  username = requestedUsername;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  socket = new WebSocket(
    `${protocol}//${window.location.host}/?username=${encodeURIComponent(username)}`
  );

  socket.addEventListener('open', () => {
    setConnected(true);
    messageInput.focus();
  });

  socket.addEventListener('message', (event) => {
    try {
      const payload = JSON.parse(event.data);

      if (payload.type === 'system') {
        addSystemMessage(payload.text);
      } else if (payload.type === 'chat') {
        addChatMessage(payload.username, payload.text);
      }
    } catch (error) {
      console.error('Could not parse server message:', error);
    }
  });

  socket.addEventListener('close', () => {
    setConnected(false);
    addSystemMessage('Disconnected from chat.');
    socket = null;
  });

  socket.addEventListener('error', () => {
    addSystemMessage('Could not connect to the chat server.');
  });
});

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = messageInput.value.trim();
  if (!text || socket?.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(JSON.stringify({ username, text }));
  messageInput.value = '';
  messageInput.focus();
});

setConnected(false);
