const userService = require('../models/userService');
const ensureAuthenticated = require('../middlewares/authMiddleware');
const Employee = require('../models/Employee');
const bcrypt = require('bcrypt'); // For password hashing
const validator = require('validator'); // For email validation

exports.login = async (req, res) => {
  const { email, password } = req.body; // Get login details from the request body

  try {
      // Step 1: Validate the email format
      if (!validator.isEmail(email)) {
         return res.status(400).json({ message: 'Invalid email format' });
      }

      // Step 2: Retrieve employee by email
      const employee = await Employee.findByEmail(email); // Fetch employee from DB
      if (!employee) {
          return res.status(401).json({ message: 'Invalid email or password' });
      }
      // Step 3: Validate the password using the public method
      const passwordMatch = await employee.validatePassword(password);
      if (!passwordMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Step 3: Store employee data in session (excluding private info)
      req.session.user = {
          employee_id: employee.employee_id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          honorifics: employee.honorifics,
          email: employee.getEmail(),
          position: employee.position,
          department_id: employee.department_id,
      };

      // Step 4: Redirect to the home page or return a success message
      res.redirect('/home'); // You can customize the redirection route as needed
  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
  }
};

// Handle logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
        }
        res.redirect('/');
    });
};

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, middleName, lastName, honorifics, introduction, position, researchFields, department, image_id } = req.body;

        // Sanitize researchFields
        let formattedResearchFields = [];
        if (researchFields && (Array.isArray(researchFields) || typeof researchFields === 'string')) {
            if (Array.isArray(researchFields)) {
                // Extract values if it's an array of objects
                formattedResearchFields = researchFields.map(field => field.value);
            } else {
                // Parse and extract values if it's a JSON string
                formattedResearchFields = JSON.parse(researchFields).map(field => field.value);
            }
        }
        // Create the updated profile data
        const updatedProfileData = {
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                honorifics: honorifics,
                introduction: introduction,
                position: position,
                field: formattedResearchFields, 
                department_id: department,
        };
        if (image_id) {
            updatedProfileData.image_id = image_id;
        }

        console.log(updatedProfileData);

        // Update the user profile in the database here
        // Assuming you have a function in your model to handle this
        await Employee.update(req.session.user.employee_id, updatedProfileData);
        
        // Update session with the new profile data, while preserving existing values
        if (req.session.admin){
            const adminSession = req.session.admin; // Store admin session data temporarily
            req.session.admin = adminSession; // Restore the admin session
            console.log(adminSession);
        }
        req.session.user = {
            ...req.session.user, // Spread existing session values (preserve email, employee_id, etc.)
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            honorifics: honorifics,
            position: position,
            department_id: department,
        };

        // Send a success response
        res.status(200).json({ message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const employee_id = req.session.user.employee_id;
    try {
        const employee = await Employee.findById(employee_id);

        if (!employee) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const checkPassword = await employee.validatePassword(oldPassword);
        if (!checkPassword) {
            return res.status(401).json({ message: 'Current password is incorrect!' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await Employee.changePassword(employee_id, hashedPassword);

        res.status(200).json({ message: 'Password changed successfully!' });

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Failed to change password' });
    }
}