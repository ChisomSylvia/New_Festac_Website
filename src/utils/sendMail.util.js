import transporter from "../libs/nodemailer.lib.js";

const contactMsgHtml = (fullName, email, phoneNumber, message) => {
  return `
<!DOCTYPE html>
<html lang="en">
 <head>
   <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   <style>
     html, body {
       height: 100%;
       margin: 0;
       display: flex;
       align-items: center;
       justify-content: center;
       font-family: sans-serif;
       background-color: lightblue;
       color: #0c0c0c;
       line-height: 25px;
     }
     main {
       max-width: 600px;
       background-color: white;
       padding: 20px;
       border - radius: 8 px;
       box - shadow: 0 2 px 10 px rgba(0, 0, 0, 0.1);
     }
     .img-div {
       padding: 10px 0;
       background-color: #ffffff;
     }
     div img {
       width: 250px;
     }
     div h1 {
       font-family: serif;
       font-size: 18px;
       font-weight: bold;
       color: #061425;
     }
     table {
       width: 100%;
       border-width: 0;
       border-collapse: collapse;
       margin: 20px 0;
     }
     th {
       border: none;
       color: #061425;
       padding: 8px;
       text-align: left;
       font - weight: bold;
       vertical - align: top;
     }
     td {
       border: none;
       padding: 8px;
       text-align: right;
       vertical - align: top;
       word - wrap: break -word;
     }
   </style>
 </head>

 <body>
   <main>
     <div class="img-div">
       <img
         src = "https://festac-project.vercel.app/_next/image?url=%2Ffeslogo.png&w=64&q=75"
         alt="New Festac Property Development Company Logo"
       />
     </div>
     <div>
       <h1>Hello Admin,</h1>
       <p>
          You have a new message from your website contact form!
       </p>
       <br>
       <table>
         <tr>
           <th>Fullname:</th>
           <td>${fullName}</td>
         </tr>
         <tr>
           <th>Email:</th>
           <td>${email}</td>
         </tr>
         <tr>
           <th>Subject:</th>
           <td>${phoneNumber}</td>
         </tr>
         <tr>
           <th>Message:</th>
           <td>${message}</td>
         </tr>
         <tr>
           <th>Date:</th>
           <td>${new Date().toLocaleString()}</td>
         </tr>
       </table>
     </div>
   </main>
 </body>
</html>

`;
};

const subscribedHtml = () => {
  return `
<!DOCTYPE html>
<html lang="en">
 <head>
   <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   <style>
     html, body {
       margin: 0;
       padding; 0
       font-family: Arial, sans-serif;
       background-color: #f4f4f4;
     }
     .email-container {
       max-width: 600px;
       background-color: #ffffff;
       margin: 30px auto
       padding: 30px;
       border-radius: 8px;
       box-shadow: 0 0 10 px rgba(0, 0, 0, 0.05);
     }
     .img-div {
       padding: 10px 0;
     }
     div img {
       width: 250px;
     }
     h1 {
       font-size: 24px;
       color: red;
     }
     p {
       font-size: 16px;
       line-height: 1.6;
       color: #333333;
     }
     .footer {
       font-size: 14px;
       text-align: center,
       line-height: 1.6;
       color: #888888;
     }
    
   </style>
 </head>

 <body>
   <main>
     <div class="img-div">
       <img
         src = "https://festac-project.vercel.app/_next/image?url=%2Ffeslogo.png&w=64&q=75"
         alt="New Festac Property Development Company Logo"
       />
     </div>
     <div class="email-container">
       <h1>Hello,</h1>
       <p>
          Welcome, and thank you for subscribing to New Festac Property Development Company!
       </p>
       <p>
          We are excited to keep you updated with the latest property listings, land development opportunities, investment tips, and project updates - all designed to help you make smart, informed decisions in real estate.
       </p>
       <p>
          Whether you're looking to buy, invest, or simply stay in the know, we're here to guide you every step of the way.
       </p>
       <p>
          Stay tuned!
       </p>
       <br>
       <div class="footer">
          <p>
              Warm Regards, <br>
              <strong> New Festact Property Development Company (NFPDC) </strong>
          </p>
       </div>
     </div>
   </main>
 </body>
</html>

`;
};

//send contact form notification message
const sendNotificationEmail = async (fullName, email, phoneNumber, message) => {
  const html = contactMsgHtml(fullName, email, phoneNumber, message);

  const mailOptions = {
    from: `New Festac Phase 2 website <${process.env.NODEMAILER_USER}>`,
    to: process.env.NODEMAILER_USER,
    subject: "You have a new Message",
    html,
  };

  try {
    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "Email sent successfully!",
    };
  } catch (error) {
    console.error("Email sending failed", error);

    throw error;
  }
};

//send subscribed welcome email
const sendSubscribedEmail = async (email) => {
  const html = subscribedHtml();

  const mailOptions = {
    from: `New Festac Property Development Company <${process.env.NODEMAILER_USER}>`,
    to: email,
    subject: "Welcome to NFPDC!",
    html,
  };

  try {
    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "Email sent successfully!",
    };
  } catch (error) {
    console.error("Email sending failed", error);

    throw error;
  }
};

export { sendNotificationEmail, sendSubscribedEmail };