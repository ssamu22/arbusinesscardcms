const supabase = require("../utils/supabaseClient");
const Event = require("../models/Event");
const Image = require("../models/Image");

exports.getAllEvents = async (req, res) => {
  const eventResponse = await Event.getAllEvents();

  const events = await Promise.all(
    eventResponse.map(async (event) => {
      const image = await Image.getImageById(event.image_id);
      console.log("THIS IS THE EVENT IAMGE:", image);
      return { ...event, imageUrl: image.image_url };
    })
  );

  res.status(200).json({
    status: "success",
    message: "successfully retrieved all events",
    events,
  });
};

exports.addEvent = async (req, res) => {
  const newData = {
    event_name: req.body.event_name,
    date: req.body.event_date,
    event_desc: req.body.event_desc,
  };

  if (req.file) {
    const eventImageFile = req.file;

    console.log("FILE UPLOADED:", req.file);

    const uploadedImage = await Image.uploadImage(
      eventImageFile,
      req.body.event_bucket,
      eventImageFile.originalname
    );

    newData.image_id = uploadedImage.image_id;
  }

  const newEvent = await Event.addEvent(newData);
  res.status(200).json({
    status: "success",
    message: "successfully added an lpu award!",
    data: newEvent.data[0],
  });
};

exports.updateEvent = async (req, res) => {
  const newData = {
    event_name: req.body.event_name,
    date: req.body.event_date,
    event_desc: req.body.event_desc,
  };

  if (req.file) {
    const eventImageFile = req.file;

    console.log("FILE UPLOADED:", req.file);

    const uploadedImage = await Image.uploadImage(
      eventImageFile,
      req.body.event_bucket,
      eventImageFile.originalname
    );

    newData.image_id = uploadedImage.image_id;
  }

  const newEvent = await Event.updateEvent(req.params.eventId, newData);

  console.log("UPDATED EVENT:", newEvent);
  res.status(200).json({
    status: "success",
    message: "successfully updated an lpu event!",
    data: newEvent.data[0],
  });
};

exports.deleteEvent = async (req, res) => {
  await Event.deleteEvent(req.params.eventId);

  res.status(204).json({
    status: "success",
    message: "successfully deleted data!",
  });
};
