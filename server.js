const mongoose=require("mongoose"); 
const Document= require("./Document");

mongoose.connect("mongodb://localhost/dox", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const defaultValue = "";

io.on("connection", (socket) => {

  //get-document event if data is present in document
  socket.on("get-document", async documentId=>{
    const document=await findOrCreateDocument(documentId);

    // it joins a seperate room for every document
    socket.join(documentId);
    socket.emit("load-document", document.data);
    
    //send-changes event
    socket.on("send-changes", delta => {
      // broadcasting changes to everyone else that are recieved from client
      socket.broadcast.to(documentId).emit("recieve-changes",delta);
    });

    // saving our content
    socket.on("save-document", async data=>{
      await Document.findByIdAndUpdate(documentId, {data});
    } )
  });
});

async function findOrCreateDocument(id){
  if(id==null) return;

  const document= await Document.findById(id);
  //if present return it
  if(document) return document;
  // else create new return it
  return await Document.create({ _id: id, data: defaultValue});
}
