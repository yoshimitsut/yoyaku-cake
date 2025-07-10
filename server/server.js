// backend/server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

require('dotenv').config();
const nodemailer = require('nodemailer');

app.use(cors());
app.use(express.json());

const orderPath = path.join(__dirname, 'data', 'order.json');

// Garante que o arquivo existe
if (!fs.existsSync(orderPath)) {
  fs.writeFileSync(orderPath, JSON.stringify({ orders: [] }, null, 2));
}

app.get('/api/list', (req, res) => {
  fs.readFile(orderPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erro ao ler os pedidos.' });

    try {
      const pedidos = JSON.parse(data);
      res.json(pedidos.orders); // <- envia só a lista
    } catch (e) {
      res.status(500).json({ error: 'Arquivo JSON inválido.' });
    }
  });
});


// POST para salvar um novo pedido
app.post('/api/reserva', (req, res) => {
  const newOrder = req.body;

  fs.readFile(orderPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erro ao ler o arquivo.' });

    let json;
    try {
      json = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'Arquivo JSON inválido.' });
    }

    const lastId = json.orders.length > 0 ? json.orders[json.orders.length - 1].id_order : 0;
    newOrder.id_order = lastId + 1;

    json.orders.push(newOrder);

    fs.writeFile(orderPath, JSON.stringify(json, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao salvar o pedido.' });
      // res.json({ success: true, id: newOrder.id_order });
          fs.writeFile(orderPath, JSON.stringify(json, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Erro ao salvar o pedido.' });

            // Enviar e-mail ao cliente
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

            QRCode.toDataURL(String(newOrder.id_order), async (err, qrDataUrl) => {
            if (err) {
              console.error('Erro ao gerar QR Code:', err);
              return res.json({ success: true, id: newOrder.id_order, emailSent: false });
            }

            const htmlContent = `
              <h2>🎂 ご注文ありがとうございます！</h2>
              <p>注文番号: <strong>${newOrder.id_order}</strong></p>
              <p>お名前: ${newOrder.first_name} ${newOrder.last_name}</p>
              <p>電話番号: ${newOrder.tel}</p>
              <p>受け取り日時: ${newOrder.date} - ${newOrder.hour}</p>
              <p>ご注文内容:</p>
              <ul>
                ${newOrder.cakes.map(c => `<li>${c.name} - ${c.amount}個</li>`).join('')}
              </ul>
              <p>こちらが受付用QRコードです:</p>
              <img src="cid:qrcode" alt="QRコード" width="200" />
              <p>またのご利用をお待ちしております。</p>
            `;

            const mailOptions = {
              from: `"Pâtisserie Cake" <${process.env.EMAIL_USER}>`,
              to: newOrder.email,
              subject: `🎂 ご注文確認 - 注文番号 ${newOrder.id_order}`,
              html: htmlContent,
              attachments: [
                {
                  filename: 'qrcode.png',
                  content: qrDataUrl.split("base64,")[1],
                  encoding: 'base64',
                  cid: 'qrcode', // mesmo CID usado no <img src="cid:qrcode" />
                },
              ],
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error('Erro ao enviar e-mail:', error);
                return res.json({ success: true, id: newOrder.id_order, emailSent: false });
              }
              console.log('E-mail enviado com QR Code!');
              res.json({ success: true, id: newOrder.id_order, emailSent: true });
            });
          });


            const mailOptions = {
              from: `"Pâtisserie Cake" <${process.env.EMAIL_USER}>`,
              to: newOrder.email,
              subject: `🎂 ご注文確認 - 注文番号 ${newOrder.id_order}`,
              html: htmlContent,
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error('Erro ao enviar e-mail:', error);
                return res.json({ success: true, id: newOrder.id_order, emailSent: false });
              }
              console.log('E-mail enviado: ' + info.response);
              res.json({ success: true, id: newOrder.id_order, emailSent: true });
            });
          });

    });
  });
});

// Rota para atualizar status e pagamento de um pedido
app.put('/api/reserva/:id_order', (req, res) => {
  const idOrder = parseInt(req.params.id_order);
  const { status, payment } = req.body;

  fs.readFile(orderPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erro ao ler o arquivo.' });

    let json;
    try {
      json = JSON.parse(data);
    } catch {
      return res.status(500).json({ error: 'Arquivo JSON inválido.' });
    }

    const index = json.orders.findIndex(o => o.id_order === idOrder);
    if (index === -1) return res.status(404).json({ error: 'Pedido não encontrado.' });

    // Atualiza status e pagamento
    json.orders[index].status = status;
    json.orders[index].payment = payment;

    fs.writeFile(orderPath, JSON.stringify(json, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao salvar o pedido.' });
      res.json({ success: true });
    });
  });
});

app.listen(3001, () => {
  console.log('Servidor rodando em http://localhost:3001');
});
