import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import connectDB from "./database/connectDB.js"
import arrangementRoutes from "./routes/arrangement.routes.js";
import csvRoutes from "./routes/csv.routes.js";


const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: process.env.CORS_ORIGIN?.split(",") || "*", methods: ["GET","POST"] }
});

// --- Socket rooms per arrangement ---
io.on("connection", (socket) => {
  // client sends { arrangementId }
  socket.on("joinArrangement", ({ arrangementId }) => {
    if (arrangementId) socket.join(arrangementId);
  });

  socket.on("leaveArrangement", ({ arrangementId }) => {
    if (arrangementId) socket.leave(arrangementId);
  });

  socket.on("disconnect", () => {});
});

// expose io to routes via app locals
app.locals.io = io;

// REST
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));
app.use(express.json());
app.use("/", arrangementRoutes);
app.use("/csv", csvRoutes);

const start = async () => {
  await connectDB(process.env.MONGODB_URI);
  const port = process.env.PORT || 5000;
  server.listen(port, () => console.log(`API on http://localhost:${port}`));
};
start();
