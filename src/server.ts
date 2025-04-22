import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/dbConfig";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";

// Import Routes
import crimeRoutes from "./routes/crime.routes";
import cameraRoutes from "./routes/camera.routes";
import userRoutes from "./routes/user.routes";
import notificationRoutes from "./routes/notification.routes";
import supervisedLocationRoutes from "./routes/supervisedLocation.routes";

// App setup
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: ["http://localhost:5000", "https://umuhanda.netlify.app"], // ✅ Allow frontend origin
    credentials: true, // ✅ Allow cookies and authorization headers
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Version"], // ✅ Allow these headers
  })
);

// Routes
app.use("/api/crimes", crimeRoutes);
app.use("/api/cameras", cameraRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/locations", supervisedLocationRoutes);

// Connect DB and start server
const PORT = process.env.PORT || 3000;
connectDB();

const server = http.createServer(app);
server.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));

export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5000", "https://crime-prevention.netlify.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Listen for connections
io.on("connection", (socket: any) => {
  console.log("✅ A client connected:", socket.id);
});
