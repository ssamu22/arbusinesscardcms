const path = require("path");
const supabase = require("../utils/supabaseClient");
const Contact = require("../models/Contact");
const Employee_schedule = require("../models/Employee_schedule");

exports.getAllContacts = async (req, res) => {
  const { data, error } = await supabase.from("contact").select();

  if (error) {
    res.status(404).json({
      status: "failed",
      message: "failed to retrieve contacts",
      error,
    });
  }

  console.log("ALL CONTACTS:", data);

  res.status(200).json({
    status: "success",
    message: "All contacts successfully retrieved",
    data,
  });
};

exports.getContacts = async (req, res) => {
  const employee_id = req.session.user.employee_id; // Get the user ID from the session
  try {
    const contacts = await Contact.getAllContact(employee_id); // Fetch user info from the database
    const fname = req.session.user.first_name;
    const lname = req.session.user.last_name;
    const name = `${fname} ${lname}`; // Combine first and last name to form the full name
    const position = req.session.user.position;
    const email = req.session.user.email;
    
    console.log(JSON.stringify(contacts || [])); // Log contacts or an empty array

    res.json({
      name,
      email,
      position,
      contacts: contacts || [], // Return an empty array if no contacts are found
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateContacts = async (req, res) => {
  const entry = req.body;
  const employee_id = req.session.user.employee_id;

  try {
    // Check if a contact exists for the given contact_id
    if (entry.contact_id) {
      const {
        contact_id,
        phone_number,
        landline,
        email,
        facebook_url,
        instagram_url,
        linkedin_url,
      } = entry;
      const contact = await Contact.getById(contact_id);

      if (contact) {
        // LOG PHONE NUMBER
        if (contact.phone_number != phone_number) {
          const { data: newLog, error: logError } = await supabase
            .from("log")
            .insert({
              action: "UPDATE_PHONE_NUMBER",
              action_details: `${contact.phone_number} -> ${phone_number}`,
              actor: req.session.user.email,
              is_admin: false,
              status: "requested",
              employee_number: req.session.user.employee_number,
            })
            .select()
            .single();

          if (logError) {
            console.log("Error in adding new log:", logError);
            return res.status(400).json({ message: "Error adding log" });
          }

          console.log("New log added:", newLog);
        }

        // LOG FACEBOOK
        if (contact.facebook_url != facebook_url) {
          const { data: newLog, error: logError } = await supabase
            .from("log")
            .insert({
              action: "UPDATE_FB_URL",
              action_details: `Facebook URL updated`,
              actor: req.session.user.email,
              is_admin: false,
              status: "success",
              employee_number: req.session.user.employee_number,
            })
            .select()
            .single();

          if (logError) {
            console.log("Error in adding new log:", logError);
            return res.status(400).json({ message: "Error adding log" });
          }

          console.log("New log added:", newLog);
        }

        // LOG INSTAGRAM
        if (contact.instagram_url != instagram_url) {
          const { data: newLog, error: logError } = await supabase
            .from("log")
            .insert({
              action: "UPDATE_INSTAGRAM_URL",
              action_details: `Instagram URL updated`,
              actor: req.session.user.email,
              is_admin: false,
              status: "requested",
              employee_number: req.session.user.employee_number,
            })
            .select()
            .single();

          if (logError) {
            console.log("Error in adding new log:", logError);
            return res.status(400).json({ message: "Error adding log" });
          }

          console.log("New log added:", newLog);
        }

        // LOG LINKEDIN
        if (contact.linkedin_url != linkedin_url) {
          const { data: newLog, error: logError } = await supabase
            .from("log")
            .insert({
              action: "UPDATE_LINKEDIN_URL",
              action_details: `LinkedIn URL updated`,
              actor: req.session.user.email,
              is_admin: false,
              status: "requested",
              employee_number: req.session.user.employee_number,
            })
            .select()
            .single();

          if (logError) {
            console.log("Error in adding new log:", logError);
            return res.status(400).json({ message: "Error adding log" });
          }

          console.log("New log added:", newLog);
        }

        // If the contact exists and belongs to the current employee, update it

        contact.phone_number = phone_number;
        contact.landline = landline;
        contact.email = email;
        contact.facebook_url = facebook_url;
        contact.instagram_url = instagram_url;
        contact.linkedin_url = linkedin_url;

        const updatedContact = await contact.save();
        console.log(JSON.stringify(updatedContact));

        console.log("UPDATED CONTACT:", updatedContact);

        return res.status(200).json(updatedContact); // Return updated contact
      } else {
        console.error(`Contact with ID ${contact_id} not found`);
      }
    } else {
      // If no contact exists, create a new one
      const {
        phone_number,
        landline,
        email,
        facebook_url,
        instagram_url,
        linkedin_url,
      } = entry;
      const newContact = new Contact(
        null,
        employee_id,
        phone_number,
        landline,
        email,
        facebook_url,
        instagram_url,
        linkedin_url
      );

      const createdContact = await newContact.save(); // Call a create method to insert a new contact

      console.log("CREATED CONTACT:", createdContact);
      console.log(JSON.stringify(createdContact));
      return res.status(201).json(createdContact); // Return the newly created contact
    }
  } catch (error) {
    console.error("Error updating or creating contact:", error);
    res.status(500).json({ error: "Failed to update or create contact" });
  }
};
