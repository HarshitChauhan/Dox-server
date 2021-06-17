const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {

  //get-document event if data is present in document
  socket.on("get-document", documentId=>{
    const initialData="";
    // it joins a seperate room for every document
    socket.join(documentId);
    socket.emit("load-document", initialData);
    
    //send-changes event
    socket.on("send-changes", delta => {
      // broadcasting changes to everyone else that are recieved from client
      socket.broadcast.to(documentId).emit("recieve-changes",delta);
    });
  });
  //console.log(documentId);

  
});
