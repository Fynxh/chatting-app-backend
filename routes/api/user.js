const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const auth = require("../../middleware/auth");

const Users = require("../../models").Users;

// @route   GET /api/user
// @desc    Get all users
// @access  Private
router.get("/mahasiswa", auth, (req, res) => {
  Users.findAll({
    attributes: {
      exclude: [
        "jenis_kelamin",
        "email",
        "type",
        "photo",
        "password",
        "createdAt",
        "updatedAt",
        "deletedAt",
      ],
    },
    where: {
      type: "Mahasiswa",
    },
  })
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((err) => {
      return res.status(500).json(err);
    });
});

// @route   POST /api/user/avatar
// @desc    Upload avatar
// @access  Private
router.patch("/avatar", auth, (req, res) => {
  //   res.json(req.user.id);

  //   get user data from id wich in token
  Users.findOne({
    where: {
      id: req.user.id,
    },
  }).then((usr) => {
    const npm_nid = usr.npm_nid;
    // console.log(npm_nid);

    //  multer storage initiation
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "client/public/avatar");
      },
      filename: function (req, file, cb) {
        cb(null, npm_nid + path.extname(file.originalname));
      },
    });

    const upload = multer({ storage: storage }).single("photo");

    upload(req, res, function (err) {
      //  check multer error
      if (err instanceof multer.MulterError) {
        return res.status(500).json(err);
      } else if (err) {
        return res, status(500).json(err);
      }

      if (!req.file) {
        return res.status(401).json({ msg: "Please enter the photo!" });
      }

      const photo = npm_nid + path.extname(req.file.originalname);

      Users.update(
        { photo: photo },
        {
          where: {
            npm_nid: npm_nid,
          },
        }
      )
        .then((result) => {
          return res.status(200).json({ msg: "Avatar updated!" });
        })
        .catch((err) => {
          return res.status(500).json(err);
        });
    });
  });
});

// dummy
router.get("/dummy", (req, res) => {
  res.status(200).json({
    data: {
      id: 1,
      name: "Admin Adya Anggara",
    },
  });
});

router.get("/dum", auth, (req, res) => {
  res.status(200).json(req.user);
});

module.exports = router;
