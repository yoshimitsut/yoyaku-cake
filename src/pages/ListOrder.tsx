import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './ListOrder.css';

type Cake = {
  id_cake: number;
  name: string;
  quantity: number;
  price: number;
  image: string;
  amount: number;
};

type Order = {
  id_order: number;
  id_client: string;
  first_name: string;
  last_name: string;
  email: string;
  tel: string;
  date: string;
  hour: string;
  message: string;
  cakes: Cake[];
  status?: number; // 1: pendente, 2: finalizado
  payment?: number; // 1: pendente, 2: pago
};

export default function ListaPedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedOrder, setScannedOrder] = useState<Order | null>(null);
  const [errorSave, setErrorSave] = useState<string | null>(null);
  const [successSave, setSuccessSave] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/list')
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((error: unknown) => {
        console.error('Erro ao carregar pedidos:', error);
      });
  }, []);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 }, false);

      scanner.render(
        async (decodedText: string) => {
          setShowScanner(false);
          scanner.clear();
          try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/list`);
            const allOrders: Order[] = await res.json();
            const found = allOrders.find((o) => o.id_order === Number(decodedText));
            if (found) {
              setScannedOrder(found);
            } else {
              alert('Pedido não encontrado.');
            }
          } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
          }
        },
        (err) => {
          console.warn('Erro ao ler QR Code:', err);
        }
      );
    }
  }, [showScanner]);

  const filteredOrders = orders.filter(
    (o) =>
      o.first_name.toLowerCase().includes(search.toLowerCase()) ||
      o.last_name.toLowerCase().includes(search.toLowerCase()) ||
      o.id_client.includes(search) ||
      o.tel.includes(search)
  );

  function handleStatusChange(id_order: number, newStatus: 1 | 2) {
    setOrders((oldOrders) =>
      oldOrders.map((order) =>
        order.id_order === id_order ? { ...order, status: newStatus } : order
      )
    );
  }

  function handlePaymentChange(id_order: number, newPayment: number) {
    setOrders((oldOrders) =>
      oldOrders.map((order) =>
        order.id_order === id_order ? { ...order, payment: newPayment } : order
      )
    );
  }

  async function saveOrder(order: Order) {
    setLoadingSave(true);
    setErrorSave(null);
    setSuccessSave(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reserva/${order.id_order}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: order.status, payment: order.payment }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erro desconhecido');
      }

      setSuccessSave(`Pedido ${order.id_order} salvo com sucesso!`);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setErrorSave(`Erro ao salvar pedido ${order.id_order}: ${error.message}`);
        } else {
          setErrorSave(`Erro ao salvar pedido ${order.id_order}: erro desconhecido`);
        }
      }finally {
        setLoadingSave(false);
        setTimeout(() => setSuccessSave(null), 3000);
        setTimeout(() => setErrorSave(null), 3000);
    }
  }

   return (
    <div className="lista-pedidos-container">
      <h2>Lista de Pedidos</h2>
      <input
        type="text"
        placeholder="Pesquisar por nome, telefone ou ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="lista-pedidos-input"
      />
      <button onClick={() => setShowScanner(true)} style={{ marginBottom: 20 }}>
        📷 Ler QR Code
      </button>

      {showScanner && (
        <div id="reader" style={{ width: '300px', marginBottom: 20 }}></div>
      )}

      {scannedOrder && (
        <div style={{ border: '1px solid #007bff', padding: 12, marginBottom: 20 }}>
          <strong>Pedido Encontrado:</strong> <br />
          <strong>ID:</strong> {scannedOrder.id_order} <br />
          <strong>Cliente:</strong> {scannedOrder.first_name} {scannedOrder.last_name} <br />
          <strong>Telefone:</strong> {scannedOrder.tel} <br />
          <strong>Data:</strong> {scannedOrder.date} - {scannedOrder.hour} <br />
          <strong>Cakes:</strong>
          <ul>
            {scannedOrder.cakes.map((cake) => (
              <li key={cake.id_cake}>
                {cake.name} - Quantidade: {cake.amount} - ¥{cake.price}
              </li>
            ))}
          </ul>
        </div>
      )}

      {errorSave && <div className="error-message">{errorSave}</div>}
      {successSave && <div className="success-message">{successSave}</div>}

      {filteredOrders.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        <table className="lista-pedidos-table">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Telefone</th>
              <th>Data / Hora</th>
              <th>Mensagem</th>
              <th>Bolos</th>
              <th>Situação</th>
              <th>Pagamento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id_order}>
                <td>{order.id_order}</td>
                <td>
                  {order.first_name} {order.last_name} <br />
                  <small>ID Cliente: {order.id_client}</small>
                </td>
                <td>{order.tel}</td>
                <td>
                  {order.date} - {order.hour}
                </td>
                <td>{order.message || '(Nenhuma)'}</td>
                <td>
                  <ul>
                    {order.cakes.map((cake, index) => (
                      <li key={`${order.id_order}-${cake.id_cake}-${index}`}>
                        {cake.name} - Quantidade: {cake.amount} - ¥{cake.price}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id_order, Number(e.target.value) as 1 | 2)}
                  >
                    <option value={1}>Pendente</option>
                    <option value={2}>Finalizado</option>
                  </select>
                </td>
                <td>
                  <select
                    value={order.payment}
                    onChange={(e) => handlePaymentChange(order.id_order, Number(e.target.value))}
                  >
                    <option value={1}>Pendente</option>
                    <option value={2}>Pago</option>
                  </select>
                </td>
                <td>
                  <button
                    disabled={loadingSave}
                    onClick={() => saveOrder(order)}
                    className="btn-save"
                  >
                    {loadingSave ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
