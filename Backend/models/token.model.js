const { DataTypes } = require("sequelize");

const sequelize = require("../config/db.js");

const Token = sequelize.define(
  "Token",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    token: { type: DataTypes.STRING, allowNull: false },
    tokenType: { type: DataTypes.ENUM("refresh", "reset"), allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  },
  { tableName: "Tokens" }
);

module.exports = Token;
