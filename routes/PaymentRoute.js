import express from "express";
import { getPayments, createPayment, getPaymentById } from "../controllers/Payments.js";

import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();
router.get("/payments", verifyUser, getPayments);
router.post("/payments/:bookingId", verifyUser, createPayment);
router.get("/payments/:id", verifyUser, getPaymentById);

export default router;
