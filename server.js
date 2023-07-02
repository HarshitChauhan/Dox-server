require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { Server } = require('socket.io');
const mongoose = require("mongoose");
const Document = require("./Document");
const PORT = process.env.PORT || 3001;
const connectionString = process.env.DATABASE_URL;

const app = express();
console.log("Starting Application Server...");
const server = app.listen(PORT, () => {
  console.log(`Dox Server has been started successfully on Port: ${process.env.PORT}!`);
});

// Socket setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});
app.use(cors());

// console.log(`${process.env.DATABASE_URL}\n and ${process.env.FRONTEND_URL}\n and ${process.env.PORT}`);

// database connection
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
}).then(() =>{
  console.log('Database Connection Successfull!');
});


const defaultValue = "";

io.on("connection", (socket) => {
  //get-document event if data is present in document
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    
    // it joins a seperate room for every document
    socket.join(documentId);
    socket.emit("load-document", document.data);
    
    //send-changes event
    socket.on("send-changes", (delta) => {
      // broadcasting changes to everyone else that are recieved from client
      socket.broadcast.to(documentId).emit("recieve-changes", delta);
    });

    // saving our content
    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;
  
  const document = await Document.findById(id);
  //if present return it
  if (document) return document;
  // else create new return it
  return await Document.create({ _id: id, data: defaultValue });
}