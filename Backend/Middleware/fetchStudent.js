const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".../.env" });

const JWT_secret = process.env.JWT_SECRET;
const fetchStudent = (req, res, next) => {
  try {
    const token = req.header("authToken");
  if (!token) {
    return res
      .status(401)
      .send({ error: "Please authentictate b-y providing the token" });
  }
    const data = jwt.verify(token, JWT_secret);
    req.user = data.user;
    next();
  } catch (error) {
    return res
      .status(401)
      .send({ error: "Please authentictate by providing the valid token" });
  }
};

module.exports = fetchStudent;
