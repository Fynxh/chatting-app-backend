require("dotenv").config();
const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const sequelize = require("sequelize");
// const bodyParser = require("body-parser");
const cors = require("cors");

// routes
const user = require("./routes/api/user");
const room = require("./routes/api/room");
// const chat = require("./routes/api/chat")

const io = require("socket.io")(httpServer, {
  cors: {
    origin: process.env.ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// console.log(localStorage.getItem("token"));

app.use(cors());
// app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));

// sequelize connection
// @database-name    :process.env.DB_NAME
// @username         :process.env.DB_USERNAME
// @password         :process.env.DB_PASSWORD
const sequelizeConnect = new sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    operatorAliases: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// socket io connection
io.on("connection", (socket) => {
  console.log("user connected");

  require("./routes/api/chat")(socket, io);

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// routes
app.use("/api/user", user);
app.use("/api/room", room);
// app.use("/api/chat/", chat);

sequelizeConnect
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully");
  })
  .catch((err) => {
    console.log("Unable to connect to database: ", err);
  });

const port = process.env.SERVER_PORT;
httpServer.listen(port, () => console.log(`Server listening`));
