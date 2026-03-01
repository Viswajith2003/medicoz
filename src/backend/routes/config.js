const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });

module.exports = {
  mongoURI: process.env.MONGO_URI,
  port: process.env.PORT || 7000,
  jwtSecret: process.env.JWT_SECRET,
};
