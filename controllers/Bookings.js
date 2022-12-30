import Booking from "../models/BookingModel.js";
import User from "../models/UserModel.js";
import Vehicle from "../models/VehicleModel.js";
import { Op } from "sequelize";

export const getBookings = async (req, res) => {
  try {
    let response;
    if (req.role === "admin") {
      response = await Booking.findAll({
        attributes: ["uuid", "startDate", "endDate"],
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
          {
            model: Vehicle,
            attributes: ["brand", "photo"],
          },
        ],
      });
    } else {
      response = await Booking.findAll({
        attributes: ["uuid", "startDate", "endDate"],
        where: {
          userId: req.userId,
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
          {
            model: Vehicle,
            attributes: ["brand", "photo"],
          },
        ],
      });
    }
    res.status(200).json(response);
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
    });
    if (!booking) return res.status(404).json({ msg: "Data not found" });
    let response;
    if (req.role === "admin") {
      response = await Booking.findOne({
        attributes: ["uuid", "startDate", "endDate"],
        where: {
          id: booking.id,
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
          {
            model: Vehicle,
            attributes: ["brand", "photo"],
          },
        ],
      });
    } else {
      response = await Booking.findOne({
        attributes: ["uuid", "startDate", "endDate"],
        where: {
          id: booking.id,
          userId: req.userId,
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
          {
            model: Vehicle,
            attributes: ["brand", "photo"],
          },
        ],
      });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

export const createBooking = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      where: {
        id: req.body.vehicleId,
      },
    });
    if (vehicle) {
      await Booking.findOrCreate({
        where: {
          vehicleId: req.body.vehicleId,
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
      /*  await Booking.create({
        startDate,
        endDate,
        vehicleId,
        userId: req.userId,
      }); */
    } else {
      res.status(404).json({ msg: "Vehicle not found" });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!booking) return res.status(404).json({ msg: "Data not found" });
    const { startDate, endDate, vehicleId } = req.body;
    if (req.role === "admin") {
      await Booking.update(
        { startDate, endDate, vehicleId },
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
};

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
