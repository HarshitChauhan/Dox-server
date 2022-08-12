const mongoose = require("mongoose");
const Document = require("./Document");
const PORT = process.env.PORT;
const connectionString =
  process.env.DATABASE_URL
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

//connection with client
const io = require("socket.io")(process.env.PORT, {
  cors: {
    // origin: "https://doxapp.netlify.app",
    origin: `${process.env.FRONTENT_URL}`,
    // origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
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
