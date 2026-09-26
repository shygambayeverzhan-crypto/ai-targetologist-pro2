/** Returns true and lets the caller continue, or sends a 401 and returns
 *  false. The code is compared here, server-side inside the function —
 *  it is never present in any file the browser downloads. */
function requireAdmin(req, res) {
  const code = req.headers["x-admin-code"];
  if (!process.env.ADMIN_CODE || code !== process.env.ADMIN_CODE) {
    res.status(401).json({ error: "unauthorized" });
    return false;
  }
  return true;
}

module.exports = { requireAdmin };
