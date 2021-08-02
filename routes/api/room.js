/**
 *
 * Middleware auth masih belum mendapatkan api yang proper.
 * Masih menggunakan dummy data.
 *
 */

const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { Op } = require("sequelize");

const Rooms = require("../../models").Rooms;
const UsersRooms = require("../../models").UsersRooms;

/**
 * @route         GET /api/room/
 * @param         null
 * @description   Mendapatkan semua room yang diikuti oleh user
 * @access        Private
 * @body          null
 */
router.get("/", auth, (req, res) => {
  // Mendapatkan semua field dari tabel UserRooms yang terdapat UserId == user_id
  UsersRooms.findAll({
    where: { UserId: req.user.id },
  })
    .then((usrRoom) => {
      const roomIds = [];

      // Maping roomId yang didapatkan
      usrRoom.map((item) => {
        roomIds.push(item.RoomId);
      });

      // Mendapatkan semua data room yang memiliki id-id yang ada dalam array roomIds
      Rooms.findAll({
        where: {
          id: {
            [Op.and]: [roomIds],
          },
        },
      })
        .then((rooms) => {
          res.status(200).json(rooms);
        })
        .catch((err) => {
          res.status(500).json(err);
        });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

/**
 * @route         POST /api/room/
 * @param         null
 * @description   Membuat group baru.
 * @access        Private
 * @body          {"name": string, "groupMemeber": [userId1, userId2, ...]}
 */
router.post("/", auth, (req, res) => {
  const name = req.body.name;

  // req.body.groupMember is array
  const groupMember = req.body.groupMember;
  const userAuthId = req.user.id;

  // simple validation
  if (!name || !groupMember) {
    return res
      .status(401)
      .json({ msg: "Please enter room's name and member!" });
  }

  //   membuat group baru dengan nama
  Rooms.create({
    name: name,
  })
    .then((room) => {
      //  otomatis menambahkan si pembuat group menjadi member di group tersebut
      const userRoom = [{ UserId: userAuthId, RoomId: room.id }];

      // mapping anggota group ke dalam userRoom
      groupMember.map((item) => {
        userRoom.push({ UserId: item, RoomId: room.id });
      });

      // Menambahkan member kedalam group yang dibuat
      UsersRooms.bulkCreate(userRoom)
        .then((result) => {
          res.status(200);
        })
        .catch((err) => {
          res.json(err);
        });

      // console.log(userRoom);

      res.status(200).json({
        room,
        member: userRoom,
      });
    })
    .catch((err) => {
      res.json(err);
    });
});

/**
 * @route         PATCH /api/room/:roomId
 * @param         room_id
 * @description   Meng-update spesifik group.
 * @access        Private
 * @body          {"name": string}
 */
router.patch("/:roomId", auth, (req, res) => {
  // mendapatkan request body
  const name = req.body.name;

  //   mendapatkan nilai dari parameter berupa id room
  const roomId = req.params.roomId;

  //   cek apakah nama room yang baru diisi
  if (!name) return res.json(400).json({ msg: "Nama room diperlukan" });

  //   update nama room dengan yang baru
  Rooms.update(
    { name: name },
    {
      where: {
        id: roomId,
      },
    }
  )
    .then(() => {
      res.status(200).json({
        msg: "Room berhasil diperbarui!",
        room: {
          id: roomId,
          newName: name,
        },
      });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

/**
 * @route         DELETE /api/room/:roomId
 * @param         room_id
 * @description   Menghapus spesifik room.
 * @access        Private
 * @body          null
 */
router.delete("/:roomId", auth, (req, res) => {
  // mendapatkan id room
  const roomId = req.params.roomId;

  //   menghapus spesifik room sesuai dengan id room
  Rooms.destroy({
    where: {
      id: roomId,
    },
  })
    .then(() => {
      res
        .status(200)
        .json({ msg: `Room dengan id ${roomId} berhasil dihapus!!` });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

/**
 * @route         GET /api/room/:roomId
 * @param         room_id
 * @description   Mendapatkan room berdasarkan Id.
 * @access        Private
 * @body          null
 */
router.get("/:roomId", auth, (req, res) => {
  Rooms.findByPk(req.params.roomId)
    .then((room) => {
      res.status(200).json(room);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

/**
 * @route         GET /api/room/member/:roomId
 * @param         room_id
 * @description   Mendapatkan list member di dalam spesifik group.
 * @access        Private
 * @body          null
 */
router.get("/member/:roomId", auth, (req, res) => {
  // mendapatkan id room dari parameter
  const roomId = req.params.roomId;

  //   mendapatkan list member dengan id room
  UsersRooms.findAll({
    where: {
      RoomId: roomId,
    },
  })
    .then((member) => {
      res.status(200).json(member);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

/**
 * @route         POST /api/room/member/:roomId
 * @param         room_id
 * @description   Menambahkan member baru kedalam room yang sudah ada.
 * @access        Private
 * @body          {"groupMembers": [2, 3, 4, ...]}
 */
router.post("/member/:roomId", auth, (req, res) => {
  // get parameter
  const roomId = req.params.roomId;

  // get room by id
  Rooms.findByPk(roomId)
    .then((room) => {
      const roomName = room.name;

      // cek apakah room ada atau tidak
      if (!room) return res.status(404).json({ msg: "Room tidak ditemukan!" });

      // get member room/group dari request body berupa array yang berisi user_id
      const groupMembers = req.body.groupMember;

      const membersInGroup = [];

      // push setiap user ke membersInGroup
      groupMembers.map((member) => {
        membersInGroup.push({ UserId: member, RoomId: room.id });
      });

      // Menambahkan member baru kedalam group
      UsersRooms.bulkCreate(membersInGroup)
        .then((result) => {
          res.status(201).json({
            msg: `Member dengan id ${groupMembers} berhasil dimasukan kedalam group ${roomName}`,
          });
        })
        .catch((err) => {
          res.status(500).json({ msg: err });
        });
    })
    .catch((err) => {
      res.status(500).json({ msg: err });
    });
});

/**
 * @route         DELETE /api/room/member/:roomId
 * @param         room_id
 * @description   Menghapus member dari room yang sudah ada.
 * @access        Private
 * @body          {"userId": user_id}
 */
router.delete("/member/:roomId", auth, (req, res) => {
  // get parameter
  const roomId = req.params.roomId;
  const userId = req.body.userId;

  //   Menghapus member dengan id === userid yang ada di dalam group dengan id === roomId
  UsersRooms.destroy({
    where: {
      UserId: userId,
      RoomId: roomId,
    },
  })
    .then(() => {
      res.status(200).json({
        msg: `Member dengan id ${userId} berhasil dihapus dari group dengan id ${roomId}!!`,
      });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

module.exports = router;
