const MessagesRoom = require("../../models").MessagesRoom;
const MessagesPersonal = require("../../models").MessagesPersonal;

const fetch = require("node-fetch");
const { Op } = require("sequelize");

module.exports = function (socket, io) {
  // Mendapatkan semua pesan ketika membuka group
  socket.on("join", (roomId) => {
    // console.log(roomId);

    const id = roomId;

    MessagesRoom.findAll({
      where: {
        RoomId: id,
      },
    })
      .then((msg) => {
        //  emit ke client
        socket.emit("messagesRoom", msg);
        socket.broadcast.to(msg.RoomId).emit("messagesRoom", msg);
      })
      .catch((err) => {
        console.log("joinError: ", err);
      });

    socket.join(roomId);
  });

  //   socket.on("leave", ({ roomId }) => {
  //     socket.leave(roomId);
  //   });

  /**
   *
   * @description mengirimkan dan menerima pesan di group
   * @param       object message
   *
   * Object message sebagai berikut:
   *
   * message: {
   *  userId: user_id,
   *  roomId: room_id,
   *  text: string,
   *  file: string,
   * }
   *
   */
  socket.on("sendMessageIntoGroup", (message) => {
    MessagesRoom.create({
      UserId: message.userId,
      RoomId: message.roomId,
      text: message.text,
      file: message.file,
    })
      .then((res) => {
        // find specific message with it's user
        MessagesRoom.findByPk(res.id)
          .then((msg) => {
            // emit to client
            // io.to(msg.RoomId).emit('message from client', msg);
            socket.emit("message from group", msg);
            socket.broadcast.to(msg.RoomId).emit("message from group", msg);
          })
          .catch((err) => {
            console.log("find message in group Error:", err);
          });
      })
      .catch((err) => {
        console.log("sendMessageIntoGroupError:", err);
      });
  });

  /**
   *
   * @description mengirimkan pesan personal
   * @param       object message
   *
   * Object message sebagai berikut:
   *
   * message: {
   *  sender: user_id,
   *  receiver: user_id,
   *  text: string,
   *  file: string,
   * }
   *
   */
  socket.on("sendMessagePersonal", (message) => {
    MessagesPersonal.create({
      sender: message.sender,
      receiver: message.receiver,
      text: message.text,
      file: message.file,
    })
      .then((msg) => {
        io.emit("message from personal", msg);
      })
      .catch((err) => {
        console.log("sendMessagePeronalError:", err);
      });
  });

  /**
   *
   * @description mendapatkan semua pesan ketika membuka personal chat
   * @param       user_id
   *
   */
  socket.on("getMessagePersonal", (userId) => {
    MessagesPersonal.findAll({
      where: {
        [Op.or]: [{ sender: userId }, { receiver: userId }],
      },
    })
      .then((messages) => {
        io.emit("messagesPersonal", messages);
      })
      .catch((err) => {
        console.log("getMessagePersonalError:", err);
      });
  });
};
