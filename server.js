import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;

  if (pathname === '/script.js') {
    fs.readFile('./public/script.js', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal Server Error');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.end(data);
    });
    return;
  }

  fs.readFile('./public/index.html', (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Internal Server Error');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });

function broadcast(message) {
  const serializedMessage = JSON.stringify(message);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(serializedMessage);
    }
  });
}

wss.on('connection', (socket, req) => {
  const username = new URL(
    req.url,
    'http://localhost'
  ).searchParams.get('username');

  broadcast({
    type: 'system',
    text: `${username} joined`
  });

  socket.on('message', (message) => {
    const { username, text } = JSON.parse(message.toString());

    broadcast({
      type: 'chat',
      username,
      text
    });
  });

  socket.on('close', () => {
    broadcast({
      type: 'system',
      text: `${username} left`
    });
  });
});

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
