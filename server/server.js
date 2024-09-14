const mongoose = require("mongoose");
const Document = require("./Document");

const MONGO_URL='mongodb+srv://shaquibkhan:Rdxrdx10@cluster0.cxcv69j.mongodb.net/e-commerce?'
mongoose.connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));


const io = require("socket.io")(5174, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

console.log("Socket.io server running on port 5174");

const defaultValue = "";

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });
    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;
  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}
