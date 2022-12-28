import { Sequelize } from "sequelize";

const db = new Sequelize("rentacar_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

export default db;
