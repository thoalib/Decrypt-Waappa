import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  apiKey: process.env.API_KEY,

  r2: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKey: process.env.R2_ACCESS_KEY,
    secretKey: process.env.R2_SECRET_KEY,
    bucket: process.env.R2_BUCKET,
    publicDomain: process.env.R2_PUBLIC_DOMAIN
  }
};
