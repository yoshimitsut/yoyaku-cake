// backend/server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

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
      res.json({ success: true, id: newOrder.id_order });
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
