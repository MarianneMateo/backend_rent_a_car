import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Bookings from "./BookingModel.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const Payments = db.define(
  "payments",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    freezeTableName: true,
  }
);

Users.hasMany(Payments);
Bookings.hasHooks(Payments);
Payments.belongsTo(Bookings, { foreignKey: "bookingId" });
Payments.belongsTo(Users, { foreignKey: "userId" });

export default Payments;
