require("dotenv").config();

module.exports = {
  port: process.env.PORT,
  cors_origin1: process.env.CORS_ORIGIN1,
  cors_origin2: process.env.CORS_ORIGIN2,
  dbURL: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  github1: process.env.GITHUB1,
  github2: process.env.GITHUB2,
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET,
    endpoint: process.env.R2_S3_ENDPOINT,
    // Public base URL of the bucket, e.g. https://pub-xxxx.r2.dev
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
  },
};
