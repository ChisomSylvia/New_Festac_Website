import nodemailer from "nodemailer";
import { config } from "dotenv";
config();

// console.log('Testing credentials...');
// console.log('User:', process.env.NODEMAILER_USER);
// console.log('Password exists:', !!process.env.NODEMAILER_PASSWORD);

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

//verify transporter
export const verifyTransporter = async() => {
  try {
    await transporter.verify();
    console.log('SMTP server is ready');
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error);
    return false;
  }
};


export default transporter;