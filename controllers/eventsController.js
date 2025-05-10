const supabase = require("../utils/supabaseClient");
const Event = require("../models/Event");
const Image = require("../models/Image");

exports.getAllEvents = async (req, res) => {
  const tab = req.params.tab;

  let eventResponse;

  if (tab === "active") {
    eventResponse = await Event.getAllEvents();
  } else {
    eventResponse = await Event.getArchivedEvents();
  }

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

  // LOG ACTION
  const { data: newLog, error: logError } = await supabase
    .from("log")
    .insert({
      action: `ADD_LPU_EVENT`,
      action_details: `LPU-C Event Added: ${req.body.event_name}`,
      actor: req.session.admin.email,
      is_admin: true,
      status: "success",
      employee_number: req.session.admin.employee_number,
    })
    .select()
    .single();

  if (logError) {
    console.log("Error in adding new log:", logError);
    return res.status(400).json({ message: "Error adding log" });
  }

  console.log("New log added:", newLog);

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

  // LOG ACTION
  const { data: newLog, error: logError } = await supabase
    .from("log")
    .insert({
      action: `UPDATE_LPU_EVENT`,
      actor: req.session.admin.email,
      action_details: `LPU-C Event Updated: ${req.body.event_name}`,
      is_admin: true,
      status: "success",
      employee_number: req.session.admin.employee_number,
    })
    .select()
    .single();

  if (logError) {
    console.log("Error in adding new log:", logError);
    return res.status(400).json({ message: "Error adding log" });
  }

  console.log("New log added:", newLog);

  console.log("UPDATED EVENT:", newEvent);
  res.status(200).json({
    status: "success",
    message: "successfully updated an lpu event!",
    data: newEvent.data[0],
  });
};

exports.archiveEvent = async (req, res) => {
  const event_id = req.params.id;
  console.log("Event ID: " + event_id);

  try {
    const event = await Event.getEventById(event_id);

    if (!event) {
      return res.status(404).json({ error: "Event not found or unauthorized" });
    }

    const archivedEvent = await Event.archiveEvent(event_id, true);
    console.log("Archived Event: " + archivedEvent);

    // LOG ACTION
    const { data: newLog, error: logError } = await supabase
      .from("log")
      .insert({
        action: `ARCHIVE_LPU_EVENT`,
        actor: req.session.admin.email,
        action_details: `LPU-C Event Updated: ${event.event_name}`,
        is_admin: true,
        status: "success",
        employee_number: req.session.admin.employee_number,
      })
      .select()
      .single();

    if (logError) {
      console.log("Error in adding new log:", logError);
      return res.status(400).json({ message: "Error adding log" });
    }

    res.status(201).json(archivedEvent);
  } catch (err) {
    console.log("Error in archiving the event: ", err);
    return res.status(400).json({ message: "Error archiving the event" });
  }
};

exports.unarchiveEvent = async (req, res) => {
  const event_id = req.params.id;

  try {
    const event = await Event.getEventById(event_id);

    if (!event) {
      return res.status(404).json({ error: "Event not found or unauthorized" });
    }

    // LOG ACTION
    const { data: newLog, error: logError } = await supabase
      .from("log")
      .insert({
        action: `UNARCHIVE_LPU_EVENT`,
        actor: req.session.admin.email,
        action_details: `LPU-C Event Updated: ${event.event_name}`,
        is_admin: true,
        status: "success",
        employee_number: req.session.admin.employee_number,
      })
      .select()
      .single();

    const unarchivedEvent = await Event.archiveEvent(event_id, false);

    console.log("Unarchived Event: " + unarchivedEvent);

    res.status(201).json(unarchivedEvent);
  } catch (err) {
    console.log("Error in unarchiving the event: ", err);
    return res.status(400).json({ message: "Error unarchiving the event" });
  }
};

exports.deleteEvent = async (req, res) => {
  const { data: existingData, error: existingError } = await supabase
    .from("event")
    .select()
    .eq("event_id", req.params.eventId)
    .single();

  // LOG ACTION
  const { data: newLog, error: logError } = await supabase
    .from("log")
    .insert({
      action: `DELETE_LPU_EVENT`,
      actor: req.session.admin.email,
      action_details: `LPU-C Event Deleted: ${existingData.event_name}`,
      is_admin: true,
      status: "success",
      employee_number: req.session.admin.employee_number,
    })
    .select()
    .single();
  await Event.deleteEvent(req.params.eventId);

  if (logError) {
    console.log("Error in adding new log:", logError);
    return res.status(400).json({ message: "Error adding log" });
  }

  console.log("New log added:", newLog);

  res.status(204).json({
    status: "success",
    message: "successfully deleted data!",
  });
};
