const supabase = require("../utils/supabaseClient");
const crypto = require("crypto");

exports.getLoginPage = (req, res) => {
  res.render("auth/user/login"); // Render login.ejs
};

exports.getAdminLoginPage = (req, res) => {
  res.render("auth/admin/login"); // Render admin login page
};

exports.get404Page = (req, res) => {
  res.status(200).render("auth/page404");
};

exports.getRegisterPage = (req, res) => {
  res.status(200).render("auth/user/register");
};

exports.getSuccessPage = (req, res) => {
  res.status(200).render("auth/user/success");
};

exports.getVerifiedAdminPage = async (req, res) => {
  console.log("TOKEN:", req.params.token);

  const candidateToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log("CANDIDATE TOKEN:", candidateToken);

  const { data, error } = await supabase
    .from("admin")
    .select("*")
    .eq("account_verification_token", candidateToken)
    .single();

  console.log("THE ADMIN:", data);
  if (data == null) {
    return res.redirect("auth/page404");
  }

  const now = new Date();

  if (
    !data.verification_expiration_date ||
    new Date(data.verification_expiration_date) < now
  ) {
    return res.redirect("/auth/page404");
  }

  const { updated, theError } = await supabase
    .from("admin")
    .update({
      isActive: true,
      verification_expiration_date: null,
      account_verification_token: null,
    })
    .eq("admin_id", data.admin_id)
    .single();

  console.log(updated);

  res.status(200).render("auth/admin/verified");
};

exports.getVerifiedEmployeePage = async (req, res) => {
  console.log("TOKEN:", req.params.token);

  const candidateToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log("CANDIDATE TOKEN:", candidateToken);

  const { data, error } = await supabase
    .from("employee")
    .select("*")
    .eq("account_verification_token", candidateToken)
    .single();

  console.log("THE EMPLOYEE:", data);
  if (data == null) {
    return res.redirect("auth/page404");
  }

  const now = new Date();

  if (
    !data.verification_expiration_date ||
    new Date(data.verification_expiration_date) < now
  ) {
    return res.redirect("/auth/page404");
  }

  const { updated, theError } = await supabase
    .from("employee")
    .update({
      isActive: true,
      verification_expiration_date: null,
      account_verification_token: null,
    })
    .eq("employee_id", data.employee_id)
    .single();

  res.status(200).render("auth/user/verified");
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
    return res.redirect("/");
  }

  console.log("THE DATA;", data);
  const expirationDate = new Date(data[0].token_expiration_date).getTime();
  const now = Date.now();

  console.log("IS EXPIRED?", expirationDate < now);

  if (expirationDate < now) {
    return res.redirect("/admin");
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
    return res.redirect("/");
  }

  console.log("THE DATA;", data);
  const expirationDate = new Date(data[0].token_expiration_date).getTime();
  const now = Date.now();

  console.log("IS EXPIRED?", expirationDate < now);

  if (expirationDate < now) {
    return res.redirect("/");
  }

  res.status(200).render("auth/user/reset-password", {
    id: data[0].employee_id,
    email: data[0].email,
  });
};
