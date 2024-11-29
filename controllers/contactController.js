const path = require('path');
const supabase = require('../utils/supabaseClient');
const Contact = require('../models/Contact');
const Employee_schedule = require('../models/Employee_schedule');

exports.getContacts = async (req, res) => {
    const employee_id = req.session.user.employee_id; // Get the user ID from the session
    try {
        const contacts = await Contact.getAllContact(employee_id); // Fetch user info from the database
        const schedule = await Employee_schedule.getAllSchedule(employee_id); // Fetch schedule data from the database
        const honorifics = req.session.user.honorifics;
        const fname = req.session.user.first_name;
        const lname = req.session.user.last_name;
        const name = `${honorifics} ${fname} ${lname}`; // Combine first and last name to form the full name
        const position = req.session.user.position;

        // Check if any contacts were retrieved
        if (!contacts || contacts.length === 0) {
            return res.status(404).json({ message: 'No contacts found for this employee.' });
        }

        console.log(JSON.stringify(contacts));

        res.json({
            name,
            position,
            contacts,
            schedule
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateContacts = async (req, res) => {
    const { contact_id, phone_number, landline, email, facebook_url, instagram_url, linkedin_url } = req.body;
    const employee_id = req.session.user.employee_id; 

    try {
        const contact = await Contact.getById(contact_id);

        if (!contact || contact.employee_id !== employee_id) {
            return res.status(404).json({ error: 'contact not found or unauthorized' });
        }

        contact.phone_number = phone_number;
        contact.landline = landline;
        contact.email = email;
        contact.facebook_url = facebook_url;
        contact.instagram_url = instagram_url;
        contact.linkedin_url = linkedin_url;

        const updatedcontact = await contact.save(); // Save the new contact

        console.log(JSON.stringify(updatedcontact));

        res.status(201).json(updatedcontact); // Return the created contact
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ error: 'Failed to update contact' });
    }
}
