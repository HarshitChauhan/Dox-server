const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  //send-changes event
  socket.on("send-changes", delta => {
    // broadcasting changes to everyone else that are recieved from client
    socket.broadcast.emit("recieve-changes",delta);
  })
  
});
