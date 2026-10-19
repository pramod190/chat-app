# Real-Time Chat App

A small real-time chat application built with Node.js, Express-free HTTP serving, and the `ws` WebSocket library.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Features

- Join the room with a username
- Receive system notifications when participants join or leave
- Send and receive messages in real time
- Broadcast chat messages to all connected clients, including the sender
- Responsive browser interface

## WebSocket message format

Chat message sent by a client:

```json
{
  "username": "Alex",
  "text": "Hello everyone!"
}
```

Chat event broadcast by the server:

```json
{
  "type": "chat",
  "username": "Alex",
  "text": "Hello everyone!"
}
```

The server broadcasts system events in the form `{"type":"system","text":"Alex joined"}` and `{"type":"system","text":"Alex left"}`.
