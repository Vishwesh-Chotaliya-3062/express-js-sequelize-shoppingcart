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
    html: `
    <h2>Verify Your Email Address</h2>
    This is an automatic message from Shopping Cart registration system.<br><br>
    Thanks ${user.UserName} for creating your account on Shopping Cart.<br><br>
    Please Verify your email address and Get following Gifts:
  
    <div style="color: #6255a5">
    <h3>
    <ol>
    <li>Get 500$ in your wallet.</li>
    
    <li>Get Coupon code worth "buy one get one free" on any items available on our system.</li>

    <li>Get allowed to purchase any products available on our system.</li>
    </ol>
    </h3>
    </div>

    <div>
    In order to activate your account please use this OTP for verification.
    <br><br>
    Your OTP for verification: <a href="" style="color: #6255a5; font-size:15px;">${secretcode}</a>
    </div>`,
  };

  transporter.sendMail(verifyMail, (err, info) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log("Mail sent: ", info.response);
    }
  });
};

exports.sendGifts = (user, couponcode) => {
  const verifyMail = {
    from: "v.d.chotaliya31@gmail.com",
    to: user.Email,
    subject: "Your account is now activated",
    html: `<h1>Welcome ${user.UserName} to Shopping Cart</h1>
    
        This is an automatic message from Shopping Cart Verification System.<br><br>
        This is to inform you that your account is now verified and you got following Gifts.

        <div style="color: #6255a5">
        <h3>
        <ol>
        <li>$500 loaded in your Shopping Cart Wallet.</li>
        <br>
        <li>You got coupon code worth "buy one get one free" on any items available on our system.<br><br>
        Your Coupon Code: <a href="" style="color: #000; font-size: 15px;">${couponcode}</a></li>
        <br>
        <li>Now you allowed to purchase any products available on our system.</li>
        </ol>
        </h3>
        </div>`,
  };

  transporter.sendMail(verifyMail, (err, info) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log("Mail sent: ", info.response);
    }
  });
};

exports.sendPasswordChanged = (user) => {
  const verifyMail = {
    from: "v.d.chotaliya31@gmail.com",
    to: user.Email,
    subject: "Your password is changed",
    html: `<h1>Hello ${user.UserName}</h1>
    
        This is an automatic message from Shopping Cart Security System.<br><br>
        This is to inform you that your account password is now changed.`,
  };

  transporter.sendMail(verifyMail, (err, info) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log("Mail sent: ", info.response);
    }
  });
};
