// models/Contact.js
const supabase = require('../utils/supabaseClient');

async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from('contact')
    .select('professor_id, email')
    .eq('email', email)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

module.exports = { findUserByEmail };
