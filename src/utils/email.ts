const nodemailer = require("nodemailer");

let logger = false;
if (process.env.NODE_ENV === "development") {
  logger = true;
}

export const sendEmail = async (options: Record<string, string>) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    logger: logger,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "George Gale <gmgale@icloud.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};
