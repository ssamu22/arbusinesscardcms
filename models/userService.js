const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseApiKey = process.env.SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseApiKey);

const Contact = require('./Contact');
const Professor = require('./Employee');

async function findUserByEmail(email) {
  return await Contact.findUserByEmail(email);
}

async function findProfessorById(professor_id) {
  return await Professor.findProfessorById(professor_id);
}

module.exports = {
  findUserByEmail,
  findProfessorById,
};
