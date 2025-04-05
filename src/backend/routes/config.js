require("dotenv").config();

module.exports = {
  mongoURI: process.env.MONGO_URI,
  port: process.env.PORT || 7000,
  jwtSecret: process.env.JWT_SECRET,
};
