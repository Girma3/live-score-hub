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
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  wss.on("connection", async (socket, req) => {
    if (wsArcjet) {
      try {
        const decision = await wsArcjet.protect(req);
        if (decision.isDenied()) {
          //try again and bot detected code
          let code = decision.reason.isRateLimit() ? 1013 : 1008;
          let reason = decision.reason.isRateLimit()
            ? "Too many request!"
            : "blocked by arcjet!";
          socket.close(code, reason);
          return;
        }
      } catch (e) {
        console.error("wsArcjet error", e);
        socket.close(1011, "server security error");
        return;
      }
    }
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
