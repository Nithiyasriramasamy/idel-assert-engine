import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/api";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*", // Allow cross-origin mappings from frontend port
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Log incoming API calls
app.use((req, res, next) => {
  console.log(`[GRID LOG] ${req.method} ${req.path}`);
  next();
});

app.use("/api", router);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ONLINE", grid: "INDIAN_SPATIAL_NODES_ACTIVE" });
});

export default app;
