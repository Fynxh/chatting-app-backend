"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MessagesRoom extends Model {
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
  MessagesRoom.init(
    {
      text: DataTypes.STRING,
      file: DataTypes.STRING,
      UserId: DataTypes.INTEGER,
      RoomId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "MessagesRoom",
      paranoid: true, //soft delete
    }
  );
  return MessagesRoom;
};
