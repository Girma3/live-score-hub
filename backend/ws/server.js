import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet/arcjet.js";

function sendJson(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) {
    try {
      socket.send(JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to send to client:", err);
    }
  }
}

function broadcast(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(payload));
      } catch (err) {
        console.error("Broadcast error:", err);
      }
    }
    // don’t `return` here even  if one client closed
  }
}

function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    noServer: true, // important: we’ll handle upgrade manually
    maxPayload: 1024 * 1024,
  });

  // Handle upgrade requests
  server.on("upgrade", async (req, socket, head) => {
    if (wsArcjet) {
      try {
        const decision = await wsArcjet.protect(req);
        if (decision.isDenied()) {
          // Deny handshake before connection
          socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
          socket.destroy();
          return;
        }
      } catch (e) {
        console.error("wsArcjet error", e);
        socket.write("HTTP/1.1 503 Service Unavailable\r\n\r\n");
        socket.destroy();
        return;
      }
    }

    // If allowed, proceed with upgrade
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  // Normal connection handling
  wss.on("connection", (socket, req) => {
    sendJson(socket, { type: "welcome" });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  function broadcastMatchCreated(match) {
    broadcast(wss, {
      type: "matchCreated",
      data: match,
    });
  }

  return { broadcastMatchCreated };
}

export { attachWebSocketServer };
