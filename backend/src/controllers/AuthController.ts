import { Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository";
import jwt from "jsonwebtoken";

const userRepo = new UserRepository();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-keys";

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await userRepo.findByEmail(email);

      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Login failed" });
    }
  }

  async logout(req: Request, res: Response) {
    return res.json({ message: "Session tokens invalidated." });
  }
}
