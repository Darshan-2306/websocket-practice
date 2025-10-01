
const http = require('http');
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

const rooms = {}; 
wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.on("message", (raw) => {
    const data = JSON.parse(raw);

    if (data.type === "join") {
      const { room, user } = data;
      ws.room = room;
      ws.user = user;

      if (!rooms[room]) rooms[room] = [];
      rooms[room].push(ws);

      ws.send(JSON.stringify({ system: true, text: `Joined room: ${room}` }));
      return;
    }

    if (data.type === "chat") {
      const { room, text, id } = data;

  
      (rooms[room] || []).forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ user: ws.user, text, room, id }));
        }
      });

    //   ws.send(JSON.stringify({ ack: true, id }));
    }
  });

  ws.on("close", () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room] = rooms[ws.room].filter((c) => c !== ws);
    }
    console.log("Client disconnected");
  });
});

console.log("WebSocket server running at ws://localhost:8080");
