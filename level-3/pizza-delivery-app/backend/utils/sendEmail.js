import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, text, html }) => {
  let transporter;
  let isEthereal = false;

  // Check if SMTP details are defined, otherwise fallback to Ethereal
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    isEthereal = true;
    // Dynamically request Ethereal testing account credentials
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const mailOptions = {
    from: `"PizzaFlow Portal" <no-reply@pizzaflow.com>`,
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);

  if (isEthereal) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`\n==================================================`);
    console.log(`📧 EMAIL SENT: [${subject}] to [${to}]`);
    console.log(`🔗 View test email inbox here: ${previewUrl}`);
    console.log(`==================================================\n`);
  }

  return info;
};

export default sendEmail;
