const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // Initialize Socket.io server
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Listen for SOS alerts from the mobile app
    socket.on("sos_alert", (data) => {
      console.log("Received SOS alert from mobile:", data);
      // Broadcast this alert to the dashboard
      io.emit("new_incident", data);
    });
    
    // Listen for simulation triggers from the dashboard
    socket.on("trigger_simulation", (data) => {
       console.log("Dashboard requested simulation:", data);
       io.emit("new_incident", data);
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
