const MessagesRoom = require("../../models").MessagesRoom;
const MessagesPersonal = require("../../models").MessagesPersonal;

const fetch = require("node-fetch");

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
        const msg = msg;

        // dummy data
        // jika sidah ada api, kosongkan array nya!
        const usr = [{ id: 1, nama: "fahmi" }];
        //   const usr = [];

        // Kalau sudah ada api, gunakan code dibawah ini.
        //   Ubah "https://api.com/user/" dengan api untuk mendapatkan user by id. Biarkan ${item.UserId}.

        // msg.map((item) => {
        //    fetch(`https://api.com/user/${item.UserId}`).then(result => {
        //       usr.push(result);
        //    }).catch(err => {
        //       console.log(err);
        //    })
        // })

        //   merge array yang berisi user dengan array yang berisi pesan.
        // Mencocokan id yang dimiliki user dengan UserId yang ada pada pesan.
        const merge = (a1, a2) =>
          a1.map((message) => ({
            ...a2.find((item) => item.id === message.UserId),
            message,
          }));

        //  emit ke client
        socket.emit("messagesRoom", merge(msg, usr));
        socket.broadcast.to(msg.RoomId).emit("messagesRoom", merge(msg, usr));
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
  socket.on("sendMessageIntoGroup", (message, callback) => {
    MessagesRoom.create({
      UserId: message.userId,
      RoomId: message.roomId,
      text: message.text,
      file: message.file,
    })
      .then((res) => {
        // find specific message with it's user
        MessagesRoom.findByPk(res.id, {
          include: Users,
        })
          .then((msg) => {
            // emit to client
            // io.to(msg.RoomId).emit('message from client', msg);
            socket.emit("message from group", msg);
            socket.broadcast.to(msg.RoomId).emit("message from group", msg);
            callback(msg);
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
  socket.on("sendMessagePersonal", (message, callback) => {
    MessagesPersonal.create({
      sender: message.sender,
      receiver: message.receiver,
      text: message.text,
      file: message.file,
    })
      .then((msg) => {
        socket.emit("message from personal", msg);
        socket.broadcast.to(msg.receiver).emit("message from personal", msg);
        callback(msg);
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
        receiver: userId,
      },
    })
      .then((messages) => {
        socket.emti("messagesPersonal", messages);
        socket.broadcast.to(userId).emit("messagesPersonal", messages);
      })
      .catch((err) => {
        console.log("getMessagePersonalError:", err);
      });
  });
};
