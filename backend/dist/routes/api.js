"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const AssetController_1 = require("../controllers/AssetController");
const BookingController_1 = require("../controllers/BookingController");
const PaymentController_1 = require("../controllers/PaymentController");
const NotificationController_1 = require("../controllers/NotificationController");
const DashboardController_1 = require("../controllers/DashboardController");
const IotController_1 = require("../iot/IotController");
const PricingAi_1 = require("../ai/PricingAi");
const NegotiationAi_1 = require("../ai/NegotiationAi");
const RecommenderAi_1 = require("../ai/RecommenderAi");
const AgreementAi_1 = require("../ai/AgreementAi");
const router = (0, express_1.Router)();
const authCtrl = new AuthController_1.AuthController();
const assetCtrl = new AssetController_1.AssetController();
const bookingCtrl = new BookingController_1.BookingController();
const paymentCtrl = new PaymentController_1.PaymentController();
const notifCtrl = new NotificationController_1.NotificationController();
const dashCtrl = new DashboardController_1.DashboardController();
const iotCtrl = new IotController_1.IotController();
const pricingAi = new PricingAi_1.PricingAi();
const negAi = new NegotiationAi_1.NegotiationAi();
const recAi = new RecommenderAi_1.RecommenderAi();
const agreeAi = new AgreementAi_1.AgreementAi();
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
// IoT Locks
router.get("/iot", iotCtrl.getDeviceLogs);
router.post("/iot", iotCtrl.triggerAction);
// AI Modules
router.post("/ai/pricing", pricingAi.calculateDynamicPrice);
router.post("/ai/chat", negAi.chatBroker);
router.get("/ai/recommendation", recAi.getRecommendations);
router.post("/ai/agreement", agreeAi.generateLeaseAgreement);
exports.default = router;
