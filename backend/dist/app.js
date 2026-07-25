"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const api_1 = __importDefault(require("./routes/api"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*", // Allow cross-origin mappings from frontend port
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express_1.default.json());
// Log incoming API calls
app.use((req, res, next) => {
    console.log(`[GRID LOG] ${req.method} ${req.path}`);
    next();
});
app.use("/api", api_1.default);
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ONLINE", grid: "INDIAN_SPATIAL_NODES_ACTIVE" });
});
exports.default = app;
