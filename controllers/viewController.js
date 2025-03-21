const supabase = require("../utils/supabaseClient");
const crypto = require("crypto");

exports.getRegisterPage = (req, res) => {
  res.status(200).render("auth/user/register");
};

exports.getSuccessPage = (req, res) => {
  res.status(200).render("auth/user/success");
};

exports.getForgotPasswordPage = (req, res) => {
  try {
    res.status(200).render("auth/user/forgot-password");
  } catch (err) {
    console.log(err);
  }
};

exports.getForgotAdminPasswordPage = (req, res) => {
  console.log("FORGOT ADMIN PASSWORD!");
  res.status(200).render("auth/admin/forgot-admin-password");
};

exports.getResetAdminPasswordPage = async (req, res) => {
  // 1. Hash token so that it matches the one in the user's data

  const candidateToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // 2. Find the user using the hashed token

  const { data, error } = await supabase
    .from("admin")
    .select("*")
    .eq("password_reset_token", candidateToken);

  if (data.length === 0) {
    return res.redirect("/login");
  }

  console.log("THE DATA;", data);
  const expirationDate = new Date(data[0].token_expiration_date).getTime();
  const now = Date.now();

  console.log("IS EXPIRED?", expirationDate < now);

  if (expirationDate < now) {
    return res.redirect("/admin/login");
  }

  res.status(200).render("auth/admin/reset-admin-password", {
    id: data[0].admin_id,
    email: data[0].email,
  });
};

exports.getResetPasswordPage = async (req, res) => {
  // 1. Hash token so that it matches the one in the user's data

  const candidateToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // 2. Find the user using the hashed token

  const { data, error } = await supabase
    .from("employee")
    .select("*")
    .eq("password_reset_token", candidateToken);

  if (data.length === 0) {
    return res.redirect("/login");
  }

  console.log("THE DATA;", data);
  const expirationDate = new Date(data[0].token_expiration_date).getTime();
  const now = Date.now();

  console.log("IS EXPIRED?", expirationDate < now);

  if (expirationDate < now) {
    return res.redirect("/login");
  }

  res.status(200).render("auth/user/reset-password", {
    id: data[0].employee_id,
    email: data[0].email,
  });
};
