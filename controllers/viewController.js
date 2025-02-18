export function getRegisterPage(req, res) {
  res.status(200).render("auth/user/register");
}

export function getSuccessPage(req, res) {
  res.status(200).render("auth/user/success");
}
