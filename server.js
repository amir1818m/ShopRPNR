const express = require("express");
const http = require("http");
const { Apinator } = require("@apinator/server");

const app = express();
const server = http.createServer(app);

app.use(express.json());

const realtime = new Apinator({
  appId: "d411f94a-9a60-4214-be9c-8d399b5d5dbf",
  key: "app_10f81786849a0ad25f95c165cb326f2dfc17cd9b",
  secret: process.env.APINATOR_SECRET,
  cluster: "us"
});

app.get("/", (req, res) => {
  res.send("ShopRPNR realtime server is running!");
});

app.post("/realtime/auth", (req, res) => {
  const { socket_id, channel_name } = req.body;

  if (!socket_id || !channel_name) {
    return res.status(400).json({
      error: "Missing socket_id or channel_name"
    });
  }

  const channelData = channel_name.startsWith("presence-")
    ? JSON.stringify({
        user_id: "shoprpnr-user",
        user_info: {
          name: "ShopRPNR User"
        }
      })
    : undefined;

  try {
    const result = realtime.authenticateChannel(
      socket_id,
      channel_name,
      channelData
    );

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Authentication failed"
    });
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`ShopRPNR server running on port ${PORT}`);
});
