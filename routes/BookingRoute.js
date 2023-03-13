import express from "express";
import {
  getBookings,
  getBookingById,
  createBooking,
/*   updateBooking, */
  deleteBooking,
  findByDates,
} from "../controllers/Bookings.js";

import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();
router.get("/bookings", verifyUser, getBookings);
router.get("/bookings/:id", verifyUser, getBookingById);
router.post("/bookings/:vehicleId", verifyUser, createBooking);
router.get("/bookingsDates/:vehicleId", verifyUser, findByDates);
/* router.patch("/bookings/:id/:vehicleId", verifyUser, updateBooking); */
router.delete("/bookings/:id", verifyUser, deleteBooking);

export default router;
