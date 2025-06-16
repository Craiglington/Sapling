"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const node_http_1 = __importDefault(require("node:http"));
const host = "0.0.0.0";
const port = 8080;
const wsPort = 8081;
let clients = [];
node_http_1.default
    .createServer((req, res) => {
    if (req.method === "POST" && req.url === "/reload") {
        sendReloadMessages();
    }
    res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*"
    });
    res.end();
})
    .listen(port, host, () => {
    console.log(`Reload server listening at http://${host}:${port}`);
});
const wss = new ws_1.WebSocketServer({
    host: host,
    port: wsPort
}, () => {
    console.log(`Reload websocket server listening at http://${host}:${wsPort}`);
});
wss.on("connection", (ws) => {
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
