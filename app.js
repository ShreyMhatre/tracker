const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//app.use(express.static(path.join(__dirname, "public")));
app.use('/public', express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'text/javascript');
    }
  },
}));

app.get("/", (req, res) => {
    res.render("index");
});

let currentSocket = null;

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    const isLocalhost = socket.handshake.headers.referer?.includes('localhost');
    if (isLocalhost) {
        console.log("Connection from localhost ignored.");
        return; // Stop further processing for localhost
    }

    // Receive location from tracking device
    socket.on("send-location", (data) => {
        io.emit("receive-location", { id: socket.id, ...data });
    });

    // Notify when a user disconnects
    socket.on("disconnect", () => {
        io.emit("user-disconnected", socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Delivery: npx ngrok http ${PORT}`);
});
