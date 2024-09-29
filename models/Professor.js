// models/Professor.js
const supabase = require('../utils/supabaseClient');

async function findProfessorById(professor_id) {
  const { data, error } = await supabase
    .from('professor')
    .select('professor_id, first_name, last_name, position, introduction, password, field')
    .eq('professor_id', professor_id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

module.exports = { findProfessorById };
