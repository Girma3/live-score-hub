import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet/arcjet.js";

//add and track pub sub relationship
const matchSubscribers = new Map();

function subscribeMatch(matchId, socket) {
  if (!matchSubscribers.has(matchId)) {
    matchSubscribers.set(matchId, new Set());
  }
  matchSubscribers.get(matchId).add(socket);
}
function unsubscribeMatch(matchId, socket) {
  const subscribers = matchSubscribers.get(matchId);
  if (!subscribers) return;
  subscribers.delete(socket);
  if (subscribers.size === 0) {
    matchSubscribers.delete(matchId);
  }
}

function cleanupSubscribers(socket) {
  for (const [matchId] of matchSubscribers.entries()) {
    unsubscribeMatch(matchId, socket);
  }
  socket.subscription.clear();
}

//only to specific match or sport
function broadcastToMatch(matchId, payload) {
  const subscribers = matchSubscribers.get(matchId);
  if (!subscribers || subscribers.size === 0) return;
  const message = JSON.stringify(payload);
  for (const socket of subscribers) {
    if (socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(message);
      } catch (err) {
        console.error("Broadcast error:", err);
      }
    }
  }
}
function handleMessage(socket, data) {
  let message;
  try {
    message = JSON.parse(data.toString());
  } catch (err) {
    sendJson(socket, { type: "error", error: "Invalid json " });
    return;
  }
  if (message.type === "subscribeMatch" && Number.isInteger(message.matchId)) {
    subscribeMatch(message.matchId, socket);
    socket.subscription.add(message.matchId);
    sendJson(socket, { type: "subscribeMatch", matchId: message.matchId });
    return;
  } else if (message.type === "unsubscribeMatch") {
    unsubscribeMatch(message.matchId, socket);
    sendJson(socket, { type: "unsubscribeMatch", matchId: message.matchId });
    socket.subscription.delete(message.matchId);
    return;
  } else if (message.type === "disconnect") {
    cleanupSubscribers(socket);
    return;
  }
}

function sendJson(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) {
    try {
      socket.send(JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to send to client:", err);
    }
  }
}

function broadcastToAll(wss, payload) {
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
    socket.subscription = new Set();
    socket.isAlive = true;
    socket.on("pong", () => {
      socket.isAlive = true;
    });
    sendJson(socket, { type: "welcome" });

    socket.on("message", (data) => {
      handleMessage(socket, data);
    });
    socket.on("error", () => {
      console.error("WebSocket on error terminated");
      socket.terminate();
    });

    socket.on("close", () => {
      cleanupSubscribers(socket);
    });

    socket.on("error", (error) => {
      console.error("WebSocket on error terminated", error);
      socket.terminate();
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((client) => {
      if (!client.isAlive) return client.terminate();
      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
  });

  function broadcastMatchCreated(match) {
    broadcastToAll(wss, {
      type: "matchCreated",
      data: match,
    });
  }

  function broadcastCommentary(matchId, commentary) {
    broadcastToMatch(matchId, {
      type: "commentary",
      data: commentary,
    });
  }

  return { broadcastMatchCreated, broadcastCommentary };
}

export { attachWebSocketServer };
