const { Promise } = require("mongoose");
const nodemailer = require("nodemailer");

const sendOtpViaEmail = (email, otp) => {
  return new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "ribinmathew4u@gmail.com",
        pass: "bzojqkacnwgguplo",
      },
    });
    const mailOptions = {
      to: email,
      subject: "OTP for account verification",
      html: `<h3>OTP for account verification is:</h3><h1 style='font-weight:bold;'>${otp}</h1>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Email sending error:", error);
        reject(false);
      } else {
        resolve(true);
      }
      res.render("../views/user/otp");
    });
  });
};

module.exports = sendOtpViaEmail;
