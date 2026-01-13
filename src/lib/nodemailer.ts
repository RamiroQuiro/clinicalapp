import nodemailer from 'nodemailer';

const { EMAIL, EMAIL_PASS, HOST } = import.meta.env;
export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL,
    pass: EMAIL_PASS,
  },
});
export const mailOptions = {
  from: EMAIL,
};

export const sendMailer = async (
  email: string,
  subject: string,
  html: string
) => {
  try {
    await transporter.sendMail({
      from: EMAIL || 'ramiryexe@hotmail.com',
      to: email,
      subject: subject,
      html,
    });
    console.log(`📧 Email enviado con éxito a: ${email}`);
  } catch (error) {
    console.error('❌ Error enviando email:', error);
  }
};
