import Booking from "../models/BookingModel.js";
import User from "../models/UserModel.js";
import Vehicle from "../models/VehicleModel.js";
import { literal, Op } from "sequelize";
import moment from "moment/moment.js";
import Payment from "../models/PaymentModel.js";
import { Sequelize } from "sequelize";

export const getPayments = async (req, res) => {
  try {
    let response;
    const conditions = req.role === "admin" ? {} : { userId: req.userId };
    response = await Payment.findAll({
      where: conditions,
      include: [
        {
          model: User,
          attributes: ["name", "email"],
        },
        {
          model: Booking,
          attributes: ["uuid", "startDate", "endDate", "totalPay", "vehicleId"],
          include: [
            {
              model: Vehicle,
              attributes: ["brand", "pricePerDay", "type", "photo"],
            },
          ],
        },
      ],
    });
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: {
        uuid: req.params.id,
      },
      include: [
        {
          model: User,
        },
        {
          model: Booking,
          include: [
            {
              model: Vehicle,
            },
          ],
        },
      ],
    });
    if (payment) {
      if (payment.userId === req.userId || req.role === "admin") {
        res.status(200).json(payment);
      } else {
        res.status(403).json({ msg: "Forbidden" });
      }
    } else {
      res.status(404).json({ msg: "Payment not found" });
    }
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: {
        id: req.params.bookingId,
      },
    });
    if (!booking) return res.status(404).json({ msg: "Booking not found" });
    const amount = parseFloat(req.body.amount);
    if (amount <= 0) return res.status(400).json({ msg: "Invalid amount" });
    if (amount > booking.totalPay)
      return res.status(400).json({
        msg: `Amount exceeds total to pay, total is $${Math.trunc(
          booking.totalPay
        )}`,
      });
    await Booking.update(
      {
        totalPay: booking.totalPay - amount,
      },
      {
        where: {
          id: req.params.bookingId,
        },
      }
    );
    const payment = await Payment.create({
      amount,
      bookingId: req.params.bookingId,
      userId: req.userId,
    });
    res.status(200).json({ msg: "Payment Confirmed!", payment });
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};
