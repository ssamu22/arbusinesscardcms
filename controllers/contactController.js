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
    const { contact_id, phone_number, landline, email, facebook_url, instagram_url, linkedin_url } = req.body.contact;
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

        const updatedContact = await contact.save(); // Save the new contact

        // Handle schedule updates
        const scheduleUpdates = req.body.schedule || []; // Default to an empty array if no schedule is provided
        const updatedSchedules = []; // Array to hold results of updated schedules

        console.log("New sched: "+ JSON.stringify(scheduleUpdates));

        for (const entry of scheduleUpdates) {
            if (!entry) {
                console.error('Entry is undefined:', entry);
                continue; // Skip undefined entries
            }
        
            const { schedule_id, day, start_time, end_time, available } = entry;
        
            if (schedule_id !== null) {
                // Update existing schedule
                const existingSchedule = await Employee_schedule.getById(schedule_id);
        
                if (existingSchedule) {
                    existingSchedule.start_time = start_time;
                    existingSchedule.end_time = end_time;
                    existingSchedule.available = available;
                    const updatedSchedule = await existingSchedule.save(); // Save updated schedule
                    updatedSchedules.push(updatedSchedule); // Store the updated schedule
                } else {
                    console.error(`Schedule with ID ${schedule_id} not found`);
                }
            } else {
                // Insert new schedule entry
                const newSchedule = new Employee_schedule(
                    employee_id, // Assuming you have employee_id from session
                    day,
                    start_time,
                    end_time,
                    available
                );

                console.log("new scged: "+ JSON.stringify(newSchedule));
        
                try {
                    const savedSchedule = await newSchedule.save(); // Save the new schedule
                    updatedSchedules.push(savedSchedule); // Store the saved schedule
                    console.log('New schedule inserted:', savedSchedule);
                } catch (insertError) {
                    console.error('Error inserting new schedule:', insertError);
                }
            }
        }
        

        console.log('Updated contact:', updatedContact);
        console.log('Updated schedules:', updatedSchedules);

        res.status(200).json({
            updatedContact,
            updatedSchedules,
        });

    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ error: 'Failed to update contact' });
    }
}