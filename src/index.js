//load env values into process.env
import { config } from "dotenv";
config();

// // Add these debug lines
// console.log('Environment loaded:');
// console.log('PORT:', process.env.PORT);
// console.log('NODEMAILER_USER:', process.env.NODEMAILER_USER);
// console.log('NODEMAILER_PASSWORD exists:', !!process.env.NODEMAILER_PASSWORD);

//start the app
import express from "express";
const app = express();

//connect to database
import connectToDb from "./configs/db.config.js";

//apply middleware
import indexMiddleware from "./middlewares/index.middleware.js";
indexMiddleware(app)

// import { verifyTransporter } from "./configs/nodemailer.config.js";
// await verifyTransporter();

const PORT = process.env.PORT;


app.listen(PORT, () => {
  connectToDb();
  console.log(`App is currently running on port ${PORT}`);
});