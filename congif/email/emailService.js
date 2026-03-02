const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, text, html }) => {
  const msg = {
    to,
    from: process.env.VERIFIED_SENDER_EMAIL,
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error(
      "SendGrid Error:",
      error.response?.body || error.message
    );
    return { success: false, error };
  }
};

module.exports = sendEmail;