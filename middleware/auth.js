const fetch = require("node-fetch");
require("dotenv");

function auth(req, res, next) {
  const accessToken = req.header("Authorization");

  if (!accessToken)
    return res.status(401).json({ msg: "No token, authorization denied!" });

  const header = {
    Authorization: accessToken,
    Accept: "application/json",
  };

  fetch("https://auth-brn.neosantara.co.id/api/profile", {
    method: "get",
    headers: header,
  })
    .then((res) => res.json())
    .then((json) => {
      req.user = json.data;
      next();
    });
}

module.exports = auth;
