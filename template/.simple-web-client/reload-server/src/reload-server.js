import { WebSocketServer } from "ws";
import http from "node:http";
const host = "0.0.0.0";
const port = 8080;
const wsPort = 8081;
let clients = [];
http
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
const wss = new WebSocketServer({
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
