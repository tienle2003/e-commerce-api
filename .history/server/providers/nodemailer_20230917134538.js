import nodemailer from "nodemailer";
import mailgen from "mailgen";

const sendMail = async (receiver, mailBody, subject) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailGenerator = new mailgen({
    theme: "default",
    product: {
      name: "MITI",
      link: "#",
      logo: "https://theme.hstatic.net/1000379600/1000962941/14/share_fb_home.jpg?v=1818",
      logoHeight: "150px",
      copyright: "Copyright © 2023 MITI SHOP. All rights reserved.",
    },
  });

  const html = mailGenerator.generate(mailBody);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: receiver.email,
    html,
    subject,
  };

  await transporter
    .sendMail(mailOptions)
    .then(() => {
      console.log(`sendmail successfully to ${receiver.email}`);
    })
    .catch((err) => {
      throw new Error(err);
    });
};

const sendVerifyEmail = async (token, receiver) => {
  const mailBody = {
    body: {
      title: `HI ${receiver.name.toUpperCase()},`,
      intro:
        "Welcome to MITI E-commerce website! We're very excited to have you on board.",
      action: {
        instructions:
          "You registered an account on MITI Shop, before being able to use your account you need to verify that this is your email address by clicking here:",
        button: {
          color: "#22BC66",
          text: "Confirm your account",
          link: `http://localhost:3000/api/v1/auth/verify-email?token=${token}`,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
      greeting: "Dear",
      signature: "Sincerely",
    },
  };

  await sendMail(receiver, mailBody, "VERIFY EMAIL FOR REGISTER ACCOUNT");
};

const sendResetPassword = async (token, receiver) => {
  const mailBody = {
    body: {
      title: `HI ${receiver.name.toUpperCase()},`,
      intro: [
        "Forgot your password?",
        "We received a request to reset the password for your account.",
      ],
      action: {
        instructions: "To reset the password, please click the button below:",
        button: {
          color: "#22BC66",
          text: "Reset password your account",
          link: `http://localhost:3000/api/v1/auth/reset-password?token=${token}`,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
      greeting: "Dear",
      signature: "Sincerely",
    },
  };

  await sendMail(receiver, mailBody, "RESET PASSWORD");
};

export { sendVerifyEmail, sendResetPassword };
