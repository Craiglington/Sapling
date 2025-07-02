import { env } from "./env.js";

let reloadOnConnect = false;
function connectToWebSocket() {
  console.log("⚠️ Attempting websocket connection...");
  const socket = new WebSocket(`ws://${env.host}:${env.port}`);

  socket.addEventListener("open", () => {
    console.log("✅ Websocket connection established!");
    if (reloadOnConnect) {
      location.reload();
    }
    reloadOnConnect = true;
  });

  socket.addEventListener("message", () => {
    location.reload();
  });

  socket.addEventListener("close", () => {
    console.log("⚠️ Websocket connection closed.");
    window.setTimeout(() => {
      connectToWebSocket();
    }, 2000);
  });

  socket.addEventListener("error", (error) => {
    console.error("Websocket error:", error);
  });
}
connectToWebSocket();
