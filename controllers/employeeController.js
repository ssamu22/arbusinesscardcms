const supabase = require("../utils/supabaseClient");

exports.employeeUsesTemp = async (req, res) => {
  console.log("USER SESSION:", req.session);

  const { data, error } = await supabase
    .from("employee")
    .select("password_is_temp")
    .eq("employee_id", req.session.user.employee_id);

  console.log("THE DATA:", data);

  if (error) {
    res.status(404).json({
      status: "failed",
      error,
    });
  }
  res.status(200).json({
    status: "success",
    password_is_temp: data[0].password_is_temp,
  });
};
