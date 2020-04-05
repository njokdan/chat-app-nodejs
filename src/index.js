const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const {
  generateMessage,
  generateLocationMessage
} = require("./utils/messages");
const { addUser, removeUser, getUser, getUsers } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
  console.log("new websocket connection");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit(
      "message",
      generateMessage(`Welcome to room ${user.room}`, "Admin")
    );

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(`${user.username} has joined the room!`, "Admin")
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsers(user.room)
    });
  });

  socket.on("sendMessage", (msg, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", generateMessage(msg, user.username));
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left! :(`, "Admin")
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsers(user.room)
      });
    }
  });

  socket.on("location", (location, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(location, user.username)
    );
    callback();
  });
});

server.listen(port, () => {
  console.log("listening on " + port);
});
