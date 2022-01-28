import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "webmail",
      secureConnection: false,
      tls: {
        rejectUnauthorized: false,
      },
      host: process.env.SENDER_HOST,
      port: process.env.SENDER_EMAIL_PORT,
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_EMAIL_PASSWORD,
      },
    });

    const res = await transporter.sendMail({
      from: `Moon-Bet ${process.env.SENDER_EMAIL}`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log("ddd =>", res);
  } catch (error) {
    console.log("error in send email =>", error);
  }
};

export default sendEmail;
