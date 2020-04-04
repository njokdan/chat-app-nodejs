const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const {
  generateMessage,
  generateLocationMessage
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

let welcomeMsg = "Welcome!";

io.on("connection", socket => {
  console.log("new websocket connection");

  socket.emit("message", generateMessage(welcomeMsg));

  socket.broadcast.emit("message", generateMessage("A new user has joined :)"));

  socket.on("sendMessage", (msg, callback) => {
    io.emit("message", generateMessage(msg));
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left! :("));
  });

  socket.on("location", (location, callback) => {
    socket.broadcast.emit("locationMessage", generateLocationMessage(location));
    callback();
  });
});

server.listen(port, () => {
  console.log("listening on " + port);
});
