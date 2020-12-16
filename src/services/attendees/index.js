const express = require("express");
const Attendee = require("../../models/Attendee");
const attendeesRouter = express.Router();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { Transform } = require("json2csv");
const { pipeline } = require("stream");
var pdf = require("html-pdf");


attendeesRouter.get("/", async (req, res, next) => {
  try {
    const attendees = await Attendee.find();
    res.send(attendees);
  } catch (err) {
    next(err);
  }
});

attendeesRouter.get("/:id", async (req, res, next) => {
  try {
    const attendee = await Attendee.find({ _id: req.params.id });
    res.send(attendee);
  } catch (err) {
    next(err);
  }
});
attendeesRouter.get("/:id/pdf", async (req, res, next) => {
  try {
    const attendee = await Attendee.find({ _id: req.params.id });
    res.setHeader("Content-Disposition", "attachment; filename=export.pdf");
    const stream = await new Promise((resolve, reject) => {
      pdf.create(attendee.toLocaleString()).toStream((err, stream) => {
        if (err) {
          reject(reject);
          return;
        }
        resolve(stream);
      });
    });
    const fileName = `${+new Date()}.pdf`;
    const pdfPath = `${__dirname}/../files/${fileName}`;
    stream.pipe(res);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

attendeesRouter.post("/", async (req, res, next) => {
  const { firstName, lastName, email, arrivingAt } = req.body;
  const newAttendee = new Attendee({
    firstName,
    lastName,
    email,
    arrivingAt,
  });

  try {
    const newAttendeeSaved = await newAttendee.save();
    const msg = {
      to: newAttendee.email,
      from: "rita.petillo@me.com", // Use the email address or domain you verified above
      subject: "Thank you for registering to the event",
      text: `Hi  ${firstName} ${lastName}, this is a confirmation of your registration to the event. Your arriving time is ${arrivingAt}`,
    };
    sgMail
      .send(msg)
      .then((msg) => console.log("email sent", msg))
      .catch((err) => console.log(err));

    res.send(newAttendee);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

attendeesRouter.delete("/", async (req, res, next) => {
  try {
    await Attendee.deleteMany();
    res.send("all deleted");
  } catch (err) {
    console.log(err);
    next(err);
  }
});

attendeesRouter.get("/export/csv", async (req, res, next) => {
  try {
    const attendees = await Attendee.find().stream({
      transform: JSON.stringify,
    });
    const json2csv = new Transform({
      fields: ["firstName", "lastName", "email", "arrivingAt"],
    });
    res.setHeader("Content-Disposition", "attachment; filename=export.csv");
    pipeline(attendees, json2csv, res, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(res);
      }
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = attendeesRouter;
