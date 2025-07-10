import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail', // ou outro serviço SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/send-email', async (req, res) => {
  const { to, subject, html } = req.body;

  try {
    await transporter.sendMail({
      from: `"Pâtisserie Cake" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({ success: false, error: 'Erro ao enviar e-mail' });
  }
});

export default router;
