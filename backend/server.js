const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Initialize the app and server
const app = express();
const server = http.createServer(app);

// Allow CORS for all origins (adjust for production)
app.use(cors());

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to specify allowed origins in production
  },
});

// Store the latest location
let latestLocation = null;

// Middleware to parse JSON (for potential future REST API)
app.use(express.json());

// Handle HTTP routes
app.get("/", (req, res) => {
  if (latestLocation) {
    res.send(`
      <h1>Socket.IO Location Sharing</h1>
      <p>Latest Location Received:</p>
      <pre>${JSON.stringify(latestLocation, null, 2)}</pre>
    `);
  } else {
    res.send(`
      <h1>Socket.IO Location Sharing</h1>
      <p>No location data received yet.</p>
    `);
  }
});

// Socket.IO event handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle location sharing event
  socket.on("share-location", (data) => {
    console.log("Location shared:", data);
    latestLocation = data; // Update the latest location
    // Broadcast location to other connected clients (optional)
    socket.broadcast.emit("location-update", data);
  });

  // Handle location updates
  socket.on("updateLocation", (data) => {
    console.log("Location updated:", data);
    latestLocation = data; // Update the latest location
    // Broadcast updated location to other clients (optional)
    socket.broadcast.emit("location-update", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start the server
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
