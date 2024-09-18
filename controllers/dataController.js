const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.fetchData = async (req, res) => {
  const { data, error } = await supabase.from('your_table').select('*');
  
  if (error) {
    return res.status(500).json({ message: 'Error fetching data', error });
  }

  res.json(data);
};
