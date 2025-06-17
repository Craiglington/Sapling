var reloadOnConnect = false;
function connectToWebSocket() {
    console.log("⚠️ Attempting websocket connection...");
    var socket = new WebSocket("ws://127.0.0.1:8081");
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
        window.setTimeout(function () {
            connectToWebSocket();
        }, 2000);
    });
    socket.addEventListener("error", function (error) {
        console.error("Websocket error:", error);
    });
}
connectToWebSocket();
