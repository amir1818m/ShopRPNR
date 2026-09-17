const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const users = new Map();

app.get("/", (req, res) => {
  res.send("ShopRPNR server is running!");
});

function broadcast(data) {
  const message = JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function sendUsers() {
  broadcast({
    type: "users",
    users: Array.from(users.values())
  });
}

wss.on("connection", (socket) => {
  let username = null;

  socket.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString());

      if (data.type === "join") {
        username = String(data.username || "کاربر")
          .trim()
          .slice(0, 30);

        if (!username) username = "کاربر";

        users.set(socket, username);
        sendUsers();
        return;
      }

      if (data.type === "chat") {
        const text = String(data.text || "").trim().slice(0, 500);

        if (!text || !username) return;

        broadcast({
          type: "chat",
          username,
          text,
          time: Date.now()
        });

        return;
      }

      if (data.type === "sticker") {
        const sticker = String(data.sticker || "").slice(0, 20);

        if (!sticker || !username) return;

        broadcast({
          type: "sticker",
          username,
          sticker,
          time: Date.now()
        });
      }
    } catch (error) {
      console.log("Invalid message");
    }
  });

  socket.on("close", () => {
    users.delete(socket);
    sendUsers();
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`ShopRPNR server running on port ${PORT}`);
});
