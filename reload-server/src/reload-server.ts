import { WebSocketServer, WebSocket } from "ws";
import http from "node:http";
import { env } from "./env.js";

let clients: WebSocket[] = [];

http
  .createServer((req, res) => {
    if (req.method === "POST" && req.url === env.reloadPath) {
      sendReloadMessages();
    }
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*"
    });
    res.end();
  })
  .listen(env.serverPort, env.host, () => {
    console.log(
      `Reload server listening at http://${env.host}:${env.serverPort}`
    );
  });

const wss = new WebSocketServer(
  {
    host: env.host,
    port: env.webSocketPort
  },
  () => {
    console.log(
      `Reload websocket server listening at http://${env.host}:${env.webSocketPort}`
    );
  }
);

wss.on("connection", (ws: WebSocket) => {
  ws.on("close", () => {
    clients = clients.filter((existingWs) => existingWs !== ws);
  });

  clients.push(ws);
});

function sendReloadMessages() {
  for (const ws of clients) {
    ws.send("Reload the page!", (error) => {
      if (error) {
        clients = clients.filter((existingWs) => existingWs !== ws);
      }
    });
  }
}
