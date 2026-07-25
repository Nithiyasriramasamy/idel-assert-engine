"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const UserRepository_1 = require("../repositories/UserRepository");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRepo = new UserRepository_1.UserRepository();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-keys";
class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await userRepo.findByEmail(email);
            if (!user || user.password !== password) {
                return res.status(401).json({ error: "Invalid credentials." });
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
            return res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            });
        }
        catch (error) {
            return res.status(500).json({ error: error.message || "Login failed" });
        }
    }
    async logout(req, res) {
        return res.json({ message: "Session tokens invalidated." });
    }
}
exports.AuthController = AuthController;
