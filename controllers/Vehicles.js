import Vehicle from "../models/VehicleModel.js";

export const getVehicles = async (req, res) => {
  try {
    const response = await Vehicle.findAll();
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const response = await Vehicle.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
};

export const createVehicle = async (req, res) => {
  if (req.role === "admin") {
    try {
      await Vehicle.create(req.body);
      res.status(201).json({ msg: "Vehicle Created" });
    } catch (error) {
      console.log(error.message);
    }
  } else {
    res.status(401).json({ msg: "unauthorized" });
  }
};

export const updateVehicle = async (req, res) => {
  if (req.role === "admin") {
    try {
      await Vehicle.update(req.body, {
        where: {
          id: req.params.id,
        },
      });
      res.status(200).json({ msg: "Vehicle Updated" });
    } catch (error) {
      console.log(error.message);
    }
  } else {
    res.status(401).json({ msg: "unauthorized" });
  }
};

export const deleteVehicle = async (req, res) => {
  if (req.role === "admin") {
    try {
      await Vehicle.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.status(200).json({ msg: "Vehicle Deleted" });
    } catch (error) {
      console.log(error.message);
    }
  } else {
    res.status(401).json({ msg: "unauthorized" });
  }
};
