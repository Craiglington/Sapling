import { env } from "./env.js";

let reloadOnConnect = false;
function connectToWebSocket() {
  console.log("⚠️ Attempting websocket connection...");
  const socket = new WebSocket(`ws://${env.host}:${env.port}`);

  socket.addEventListener("open", function () {
    console.log("✅ Websocket connection established!");
    if (reloadOnConnect) {
      location.reload();
    }
    reloadOnConnect = true;
  });

  socket.addEventListener("message", function () {
    location.reload();
  });

  socket.addEventListener("close", function () {
    console.log("⚠️ Websocket connection closed.");
    window.setTimeout(() => {
      connectToWebSocket();
    }, 2000);
  });

  socket.addEventListener("error", function (error) {
    console.error("Websocket error:", error);
  });
}
connectToWebSocket();
