const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// --- In-memory incident store (persists across page navigations) ---
const incidents = [];

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Send existing incidents to newly connected clients
    socket.emit("incident_history", incidents);

    // SOS alerts from the mobile guest portal
    socket.on("sos_alert", (data) => {
      console.log("SOS alert:", data.type, "at", data.location);
      const incident = { ...data, receivedAt: Date.now() };
      incidents.push(incident);
      io.emit("new_incident", incident);
    });

    // Simulation triggers from the controller
    socket.on("trigger_simulation", (data) => {
      console.log("Simulation:", data.type, "at", data.location);
      const incident = { ...data, receivedAt: Date.now() };
      incidents.push(incident);
      io.emit("new_incident", incident);
    });

    // Incident status updates (acknowledge/resolve)
    socket.on("update_incident", (data) => {
      const idx = incidents.findIndex(i => i.id === data.id);
      if (idx !== -1) {
        incidents[idx] = { ...incidents[idx], status: data.status };
        io.emit("incident_updated", { id: data.id, status: data.status });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
