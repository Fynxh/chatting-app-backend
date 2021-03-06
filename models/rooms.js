"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Rooms extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.MessagesRoom); //onDelete: 'SET NULL', onUpdate: 'CASCADE'
    }
  }
  Rooms.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Rooms",
    }
  );
  return Rooms;
};
