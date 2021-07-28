const fetch = require("node-fetch");
require("dotenv");

function auth(req, res, next) {
  /**
   *
   * end point API belum ada.
   * Jika sudah ada, ganti "https://api.com/user" dengan end-point api yang digunakan untuk mendapatkan data user yang berhasil login!
   * Jika URI diganti, cek terlebih dahulu response nya, dan sesuaikan jika perlu.
   *
   */
  //   ================================================================
  fetch("http://localhost:5421/api/user/dummy")
    .then((res) => res.json())
    .then((json) => {
      const data = json;

      if (!data)
        return res.status(401).json({ msg: "No token, authorization denied!" });

      req.user = data.data;
      next();
    });
}

module.exports = auth;
