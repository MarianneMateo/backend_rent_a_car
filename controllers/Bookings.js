import Booking from "../models/BookingModel.js";
import User from "../models/UserModel.js";
import Vehicle from "../models/VehicleModel.js";
import Payment from "../models/PaymentModel.js";
import { literal, Op } from "sequelize";
import moment from "moment/moment.js";

export const getBookings = async (req, res) => {
  try {
    let bookings;
    const conditions = req.role === "admin" ? {} : { userId: req.userId };
    bookings = await Booking.findAll({
      where: conditions,
      include: [
        {
          model: User,
          attributes: ["name", "email"],
        },
        {
          model: Vehicle,
          attributes: ["uuid", "id", "brand", "photo", "pricePerDay"],
        },
      ],
    });
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ msg: "Bookings not found" });
    }
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: {
        uuid: req.params.id,
      },
      include: [
        {
          model: User,
          attributes: ["name", "email"],
        },
        {
          model: Vehicle,
          attributes: ["uuid", "id", "brand", "photo", "pricePerDay"],
        },
      ],
    });
    if (booking) {
      if (booking.userId === req.userId || req.role === "admin") {
        res.status(200).json(booking);
      } else {
        res.status(403).json({ msg: "Forbidden" });
      }
    } else {
      res.status(404).json({ msg: "Booking not found" });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

export const findByDates = async (req, res) => {
  let response = await Booking.findAll({
    attributes: ["startDate", "endDate"],
    where: {
      vehicleId: req.params.vehicleId,
    },
  });
  if (response.length > 0) {
    res.status(200).json(response);
  } else {
    res.status(404).json({ msg: "Data not found" });
  }
};

/* export const createBooking = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      where: {
        id: req.params.vehicleId,
      },
    });
    if (vehicle) {
      const pricePerDay = await Vehicle.findOne({
        where: { id: req.params.vehicleId },
        attributes: ["pricePerDay"],
      });
      console.log(pricePerDay);
      const duration = moment(req.body.endDate).diff(
        moment(req.body.startDate),
        "days"
      );
      const total = pricePerDay.pricePerDay * duration;
      await Booking.findOrCreate({
        where: {
          vehicleId: req.params.vehicleId,
          [Op.or]: [
            {
              startDate: {
                [Op.between]: [req.body.startDate, req.body.endDate],
              },
            },
            {
              endDate: {
                [Op.between]: [req.body.startDate, req.body.endDate],
              },
            },
          ],
        },
        defaults: {
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          totalPay: total,
          vehicleId: req.body.vehicleId,
          userId: req.userId,
        },
      }).then(([booking, create]) => {
        if (create) {
          res.status(201).json({ msg: "Booking Created Successfully" });
        } else {
          res.status(404).json({ msg: "Vehicle not available on those dates" });
        }
      });
    } else {
      res.status(404).json({ msg: "Vehicle not found" });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};
 */

export const createBooking = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      where: {
        id: req.params.vehicleId,
      },
    });
    if (!vehicle) {
      return res.status(404).json({ msg: "Vehicle not found" });
    }
    const pricePerDay = await Vehicle.findOne({
      where: { id: req.params.vehicleId },
      attributes: ["pricePerDay"],
    });
    const duration = moment(req.body.endDate).diff(
      moment(req.body.startDate),
      "days"
    );
    if (duration <= 0) {
      return res.status(400).json({ msg: "Invalid dates" });
    }
    const total = pricePerDay.pricePerDay * duration;
    const [booking, create] = await Booking.findOrCreate({
      where: {
        vehicleId: req.params.vehicleId,
        [Op.or]: [
          {
            startDate: {
              [Op.between]: [req.body.startDate, req.body.endDate],
            },
          },
          {
            endDate: {
              [Op.between]: [req.body.startDate, req.body.endDate],
            },
          },
          {
            startDate: {
              [Op.lte]: req.body.startDate,
            },
            endDate: {
              [Op.gte]: req.body.endDate,
            },
          },
        ],
      },
      defaults: {
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        totalPay: total,
        vehicleId: req.params.vehicleId,
        userId: req.userId,
      },
    });
    if (create) {
      res.status(201).json({ msg: "Booking Created Successfully" });
    } else {
      res.status(404).json({ msg: "Vehicle not available on those dates" });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

/* export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!booking) return res.status(404).json({ msg: "Data not found" });
    const pricePerDay = await Vehicle.findOne({
      where: { id: req.params.vehicleId },
      attributes: ["pricePerDay"],
    });
    console.log(pricePerDay);
    const duration = moment(req.body.endDate).diff(
      moment(req.body.startDate),
      "days"
    );
    const total = pricePerDay.pricePerDay * duration;
    const { startDate, endDate, vehicleId } = req.body;
    if (req.role === "admin") {
      await Booking.update(
        { startDate, endDate, totalPay: total, vehicleId },
        {
          where: {
            id: booking.id,
          },
        }
      );
    } else {
      if (req.userId !== booking.userId)
        return res.status(403).json({ msg: "Access prohibited" });
      await Booking.update(
        { startDate, endDate, vehicleId },
        {
          where: {
            [Op.and]: [{ id: booking.id }, { userId: req.userId }],
          },
        }
      );
    }
    res.status(200).json({ msg: "Booking updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}; */

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!booking) return res.status(404).json({ msg: "Data not found" });
    const { startDate, endDate } = req.body;
    if (req.role === "admin") {
      await Payment.destroy({
        where: {
          bookingId: booking.id,
        },
      });
      await Booking.destroy({
        where: {
          id: booking.id,
        },
      });
    } else {
      if (req.userId !== booking.userId)
        return res.status(403).json({ msg: "Access prohibited" });
      await Booking.destroy({
        where: {
          [Op.and]: [{ id: booking.id }, { userId: req.userId }],
        },
      });
    }
    res.status(200).json({ msg: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
