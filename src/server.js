const express = require("express");
const server = express();
const cors = require("cors");
const attendeesRoutes = require("./services/attendees");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3001;
const {
  catchAll,
  unauthorized,
  forbidden,
  notFound,
  badRequestHandler,
} = require("./errorHandler");

//routes

//connect to mongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }).then(() => {
  console.log("connected to mongoDB");
});

//enable cors
server.use(cors());
//going to make express able to read the body in json
server.use(express.json());

//use routes
server.use("/attendees", attendeesRoutes);

//ERROR HANDLERS
server.use(unauthorized);
server.use(forbidden);
server.use(notFound);
server.use(badRequestHandler);
server.use(catchAll);

//connect to SERVER
server.listen(PORT, () => console.log("server connecte at", PORT));
