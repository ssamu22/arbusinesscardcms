// models/Professor.js
const supabase = require('../utils/supabaseClient');

async function findProfessorById(professor_id) {
  const { data, error } = await supabase
    .from('professor')
    .select('professor_id, first_name, middle_name, last_name, honorifics, position, introduction, department_id, password, field')
    .eq('professor_id', professor_id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

async function updateProfile (req, res, profileData) {
  const { personal, professional } = profileData;
  professor_id = req.session.user.professor_id;

  try {
      const { data, error } = await supabase
          .from('professor')
          .update({
              first_name: personal.firstName,
              middle_name: personal.middleName,
              last_name: personal.lastName,
              honorifics: personal.honorifics,
              introduction: personal.introduction,
              position: professional.position,
              field: professional.researchFields, 
              department_id: professional.department
          })
          .eq('professor_id', professor_id);

      if (error) {
          console.error('Supabase update error:', error);
          return false; // Indicate that the update failed
      }

      console.log('Update Result:', data); // Log the updated data

      req.session.user.department_id = professional.department; // Update position in session
      req.session.user.honorifics = personal.honorifics; // Update position in session
      req.session.user.position = professional.position; // Update position in session

      return data.length > 0; // Check if any rows were updated
  } catch (error) {
      console.error('Error updating user profile in the database:', error);
      throw error; // Throw error to be caught in the controller
  }
}

module.exports = { findProfessorById, updateProfile };
