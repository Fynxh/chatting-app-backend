"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MessagesPersonal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MessagesPersonal.init(
    {
      text: DataTypes.STRING,
      file: DataTypes.STRING,
      sender: DataTypes.INTEGER,
      receiver: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "MessagesPersonal",
      paranoid: true, //soft delete
    }
  );
  return MessagesPersonal;
};
