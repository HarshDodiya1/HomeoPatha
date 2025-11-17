require("dotenv").config();

module.exports = {
  port: process.env.PORT,
  cors_origin1: process.env.CORS_ORIGIN1,
  cors_origin2: process.env.CORS_ORIGIN2,
  dbURL: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  github1: process.env.GITHUB1,
  github2: process.env.GITHUB2,
};
