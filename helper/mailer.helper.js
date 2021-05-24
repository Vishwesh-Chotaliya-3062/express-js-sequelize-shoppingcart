require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "v.d.chotaliya31@gmail.com",
    pass: process.env.MAIL_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

exports.sendVerifyEmail = (user, secretcode) => {
  const verifyMail = {
    from: "v.d.chotaliya31@gmail.com",
    to: user.Email,
    subject: "Please verify email to Activate your account!",
    html: `<h1>Welcome ${user.UserName}</h1>
        <p>We are glad to see you registering on E-Trading. Plaese activate your account by verifying your email address</p>
        <br><br>
        <p>Your OTP for verification: <a href="" style="color: blue;">${secretcode}</a></p>`,
  };

  transporter.sendMail(verifyMail, (err, info) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log("Mail sent: ", info.response);
    }
  });
};
