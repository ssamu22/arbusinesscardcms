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
