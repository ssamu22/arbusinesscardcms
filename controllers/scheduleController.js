const path = require('path');
const supabase = require('../utils/supabaseClient');
const Employee_schedule = require('../models/Employee_schedule');
const Consultation_type = require('../models/Consultation_type');

exports.getSchedule = async (req, res) => {
    const employee_id = req.session.user.employee_id; // Get the user ID from the session
    try {
        const schedule = await Employee_schedule.getAllSchedule(employee_id); // Fetch schedule data from the database
        const consultationTypes = await Consultation_type.getAllConsultationType(employee_id);  // Fetch consultation types of employee from the database
        
        const response = {
            schedule: schedule.map(schedule => ({
                schedule_id: schedule.schedule_id,
                day: schedule.day,
                start_time: schedule.start_time,
                end_time: schedule.end_time,
                available: schedule.available,
                location: schedule.location // Include location
            })),
            consultationTypes: consultationTypes.map(consultationType => ({
                type_id: consultationType.consultation_type_id,
                type_name: consultationType.consultation,
                type_description: consultationType.description
            }))
        };

        console.log(JSON.stringify(response));

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateSchedule = async (req, res) => {
    const schedule = req.body;
    const employee_id = req.session.user.employee_id; 

    try {
        const updatedSchedules = [];

        for (const entry of schedule) {

            if (entry.schedule_id) {
                const { schedule_id, day, start_time, end_time, available } = entry;

                console.log("updated: " + JSON.stringify(day));

                // Update existing schedule
                const existingSchedule = await Employee_schedule.getById(schedule_id);
                if (existingSchedule) {
                    existingSchedule.day = day;
                    existingSchedule.start_time = start_time;
                    existingSchedule.end_time = end_time;
                    existingSchedule.available = available;
                    
                    const updatedSchedule = await existingSchedule.save(); // Save the updated schedule
                    updatedSchedules.push(updatedSchedule);
                } else {
                    console.error(`Schedule with ID ${schedule_id} not found`);
                }
            } else {
                const { day, start_time, end_time, available } = entry;

                console.log("inserted: " + JSON.stringify(day));

                // Insert new schedule entry
                const newSchedule = new Employee_schedule(
                    null,
                    employee_id,
                    start_time,
                    end_time,
                    day,
                    available
                );

                console.log("inserted: " + JSON.stringify(newSchedule));
                const savedSchedule = await newSchedule.save(); // Save the new schedule
                updatedSchedules.push(savedSchedule); // Add the new entry to the updated schedules list
            }
        }

        console.log('Updated Schedules:', updatedSchedules);

        res.status(200).json({
            updatedSchedules
        });

    } catch (error) {
        console.error('Error updating or inserting schedules:', error);
        res.status(500).json({ error: 'Failed to update or insert schedules' });
    }
};