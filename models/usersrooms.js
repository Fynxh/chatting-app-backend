"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UsersRooms extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Rooms);
    }
  }
  UsersRooms.init(
    {
      UserId: DataTypes.INTEGER,
      RoomId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "UsersRooms",
    }
  );
  return UsersRooms;
};
