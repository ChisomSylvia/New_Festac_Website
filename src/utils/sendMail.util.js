import transporter from "../configs/nodemailer.config.js";

const emailHtml = (fullName, email, subject, message) => {
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
         src="https://genesys-revamp.netlify.app/assets/Logo-CYiOoi0Z.png"
         alt="Genesys Logo"
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
           <td>${subject}</td>
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
}


const sendNotificationEmail = async (fullName, email, subject, message) => {

  // Validate inputs
  if (!fullName || !email || !subject || !message) {
    return {
      success: false,
      message: "Missing required fields",
    };
  };

  const html = emailHtml(fullName, email, subject, message);

  const mailOptions = {
    from: `New Festac Phase 2 website <${process.env.NODEMAILER_USER}>`,
    to: process.env.NODEMAILER_USER,
    subject: "You have a new Message",
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent", info.messageId);

    return {
      success: true,
      message: "Email sent successfully!",
    };

  } catch (error) {
    console.error("Email sending failed", error);

    const message = error.message || "An unexpected error occurred";
    return {
      success: false,
      message,
    };
  }
};

export {
  sendNotificationEmail
};