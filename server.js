// server.js
const http = require('http');
const WebSocket = require('ws');
const url = require('url');

const clients = new Set(); 

  
const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); 
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/process') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      console.log('Received HTTP request:', body);
      setTimeout(() => {
        const result = { status: 'done', original: body, ts: Date.now() };   
        clients.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(result));
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ack: true }));
      }, 2000);
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});


const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    //  ws.send("Welcome to WebSocket server!");
  clients.add(ws);
  console.log('WebSocket client connected');

  ws.on('close', () => {
    clients.delete(ws);
    console.log('WebSocket client disconnected');
  });
});

// Listen on port 8080
server.listen(8080, () => {
  console.log('HTTP+WebSocket server running on http://localhost:8080');
});