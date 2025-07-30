import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  from: `"Tester" <${process.env.EMAIL_USER}>`,
  to: "shimitsutanaka@gmail.com",
  subject: "Teste Nodemailer",
  text: "Este é um teste de envio via Gmail e Nodemailer",
})
.then(() => console.log("✅ E-mail enviado com sucesso"))
.catch(err => console.error("❌ Erro ao enviar e-mail:", err));
