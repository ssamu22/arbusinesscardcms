const path = require('path');
const fs = require('fs');
const supabase = require('../utils/supabaseClient');
const Organization = require('../models/Organization');
const Image = require('../models/Image');


exports.getOrganizations = async (req, res) => {
    const employee_id = req.session.user.employee_id; // Get the user ID from the session
    try {
        const orgs = await Organization.getAllorganization(employee_id); // Fetch user info from the database

        // Check if any orgs were retrieved
        if (!orgs || orgs.length === 0) {
            return res.status(404).json({ message: 'No organizations found for this employee.' });
        }

        // Map through organizations and include image URLs
        const response = await Promise.all(
            orgs.map(async (org) => {
            // Fetch banner and logo images
            const bannerImage = org.banner_id ? await Image.getImageById(org.banner_id) : null;
            const logoImage = org.image_id ? await Image.getImageById(org.image_id) : null;
    
            // Return the organization object with image URLs
            return {
                organization_id: org.organization_id,
                org_name: org.org_name,
                org_type: org.org_type,
                category: org.category,
                description: org.description,
                banner_url: bannerImage ? bannerImage.image_url : null,
                logo_url: logoImage ? logoImage.image_url : null,
                position: org.position,
                date_joined: org.date_joined,
                date_active: org.date_active,
            };
            })
        );

        res.json(response); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.createOrganization = async (req, res) => {
    const { org_name, org_type } = req.body;
    const employee_id = req.session.user.employee_id; // Assuming the employee ID comes from the session

    try {
        const newOrganization = new Organization(null, org_name, employee_id, org_type, null);
        const createdOrganization = await newOrganization.save(); // Save the new organization

        const response = createdOrganization.map(org => ({
            organization_id: org.organization_id,
            org_name: org.org_name,
            org_type: org.org_type,
        }));

        console.log("Created: " + JSON.stringify(response[0]));

        res.status(201).json(response[0]); // Return the created organization
    } catch (error) {
        console.error('Error creating organization:', error);
        res.status(500).json({ error: 'Failed to create organization' });
    }
}

exports.uploadImage = async (req, res) => {
    try {
        const file = req.file; 
        const { bucket, fileName } = req.body;

        // Use the Image model to handle upload and creation
        const uploadedImage = await Image.uploadImage(file, bucket, fileName);

        // Return the Image object as the response
        res.json(uploadedImage);
    } catch (error) {
        console.error('Error in uploadImage:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateOrganization = async (req, res) => {
    const { organization_id, title, description, date_achieved, organization_type } = req.body;
    const employee_id = req.session.user.employee_id; 

    try {
        const organization = await organization.getById(organization_id);

        if (!organization || organization.employee_id !== employee_id) {
            return res.status(404).json({ error: 'organization not found or unauthorized' });
        }

        organization.title = title;
        organization.description = description;
        organization.date_achieved = date_achieved;
        organization.organization_type = organization_type;

        const updatedorganization = await organization.save(); // Save the new organization

        const response = await Promise.all(updatedorganization.map(async (organization) => {
            const translatedTypes = await organization.translateorganizationtype(organization.organization_type);
            return {
                organization_id: organization.organization_id,
                title: organization.title,
                description: organization.description,
                date_achieved: organization.date_achieved,
                employee_id: organization.employee_id,
                organization_type: translatedTypes, // Use the array of translated types here
            };
        }));

        console.log(JSON.stringify(response));

        res.status(201).json(response[0]); // Return the created organization
    } catch (error) {
        console.error('Error updating organization:', error);
        res.status(500).json({ error: 'Failed to update organization' });
    }
}

exports.deleteOrganization = async (req, res) => {
    const { organization_id } = req.body;

    try {
        const organization = await organization.getById(organization_id); // Fetch the existing episode by ID

        if (!organization || organization.organization_id !== organization_id) {
            return res.status(404).json({ error: 'organization not found or unauthorized' });
        }

        const deletedorganization = await organization.delete(); // delete the episode

        res.status(200).json(deletedorganization); // Return the delete episode
    } catch (error) {
        console.error('Error deleting organization:', error);
        res.status(500).json({ error: 'Failed to delete organization' });
    }
}
