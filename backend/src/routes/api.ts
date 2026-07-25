import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { AssetController } from "../controllers/AssetController";
import { BookingController } from "../controllers/BookingController";
import { PaymentController } from "../controllers/PaymentController";
import { NotificationController } from "../controllers/NotificationController";
import { DashboardController } from "../controllers/DashboardController";
import { PricingAi } from "../ai/PricingAi";
import { NegotiationAi } from "../ai/NegotiationAi";
import { RecommenderAi } from "../ai/RecommenderAi";
import { AgreementAi } from "../ai/AgreementAi";

const router = Router();

const authCtrl = new AuthController();
const assetCtrl = new AssetController();
const bookingCtrl = new BookingController();
const paymentCtrl = new PaymentController();
const notifCtrl = new NotificationController();
const dashCtrl = new DashboardController();
const pricingAi = new PricingAi();
const negAi = new NegotiationAi();
const recAi = new RecommenderAi();
const agreeAi = new AgreementAi();

// Authentication
router.post("/auth/login", authCtrl.login);
router.post("/auth/logout", authCtrl.logout);

// Assets
router.get("/assets", assetCtrl.getAll);
router.get("/assets/:id", assetCtrl.getById);
router.post("/assets", assetCtrl.create);
router.put("/assets", assetCtrl.update);
router.delete("/assets", assetCtrl.delete);

// Bookings
router.get("/bookings", bookingCtrl.getByRenter);
router.post("/bookings", bookingCtrl.create);

// Payments
router.post("/payments", paymentCtrl.processPayment);

// Notifications
router.get("/notifications", notifCtrl.getByUser);
router.put("/notifications", notifCtrl.markRead);

// Dashboard & Analytics
router.get("/dashboard", dashCtrl.getDashboardStats);
router.get("/analytics", dashCtrl.getAnalytics);

// AI Modules
router.post("/ai/pricing", pricingAi.calculateDynamicPrice);
router.post("/ai/chat", negAi.chatBroker);
router.get("/ai/recommendation", recAi.getRecommendations);
router.post("/ai/agreement", agreeAi.generateLeaseAgreement);

export default router;
