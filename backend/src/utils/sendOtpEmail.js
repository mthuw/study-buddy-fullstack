import nodemailer from "nodemailer";

let testAccount;
let transporter;

const getTransporter = async () => {
  if (!testAccount) {
    testAccount = await nodemailer.createTestAccount();
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
};

export const sendOtpEmail = async (to, otp) => {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: '"Your App" <no-reply@yourapp.com>',
    to,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
    html: `
      <h2>Your OTP Code</h2>
      <p>Your code is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 5 minutes.</p>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);

  console.log("OTP email preview:", previewUrl);

  return previewUrl;
};
