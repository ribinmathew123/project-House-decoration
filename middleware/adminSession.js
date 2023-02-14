function adminSession(req, res, next) {
  if (req.session?.email) {
    next();
  } else {
    console.log("Please log in to continue");
    res.redirect("/admin/login");
  }
}


function withOutAdminSession(req, res, next) {
  if (!req.session?.email) {
    next();
  } else {
    res.redirect("/admin");
  }
}
module.exports = {
  adminSession,
  withOutAdminSession,
};
