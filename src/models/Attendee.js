const mongoose = require("mongoose");

const AttendeeSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  arrivingAt: String

});

module.exports = mongoose.model("Attendee", AttendeeSchema);

