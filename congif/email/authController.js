// const sendEmail = require("./emailService");

// const sendOtpEmail = async ({ email, name, otp }) => {
//   return await sendEmail({
//     to: email,
//     subject: "Your OTP Verification Code",
//     text: `Hi ${name}, your OTP is ${otp}. It expires in 5 minutes.`,
//     html: `
//       <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
//         <h2 style="color: #333;">Hello ${name},</h2>

//         <p style="font-size: 16px; color: #555;">
//           Use the following One-Time Password (OTP) to verify your account:
//         </p>

//         <div style="
//           font-size: 28px;
//           font-weight: bold;
//           letter-spacing: 4px;
//           background: #f4f4f4;
//           padding: 15px;
//           text-align: center;
//           border-radius: 8px;
//           margin: 20px 0;
//         ">
//           ${otp}
//         </div>

//         <p style="color: #777; font-size: 14px;">
//           This OTP is valid for 5 minutes. Do not share this code with anyone.
//         </p>

//         <p style="margin-top: 30px; font-size: 14px; color: #999;">
//           If you did not request this, please ignore this email.
//         </p>
//       </div>
//     `,
//   });
// };

// module.exports = {
//   sendOtpEmail,
// };

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true if using port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async ({ email, name, otp }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your OTP Verification Code",
      text: `Hi ${name}, your OTP is ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
          <h2 style="color: #333;">Hello ${name},</h2>
          
          <p style="font-size: 16px; color: #555;">
            Use the following One-Time Password (OTP) to verify your account:
          </p>

          <div style="
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 4px;
            background: #f4f4f4;
            padding: 15px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
          ">
            ${otp}
          </div>

          <p style="color: #777; font-size: 14px;">
            This OTP is valid for 5 minutes. Do not share this code with anyone.
          </p>

          <p style="margin-top: 30px; font-size: 14px; color: #999;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    });

    return info;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

module.exports = {
  sendOtpEmail,
};
