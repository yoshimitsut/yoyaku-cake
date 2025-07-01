import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ListOrder from './pages/ListOrder';
import OrderCake from './pages/OrderCake';

function App() {
  return (
    <Router>
      <nav style={{ padding: 16 }}>
        <Link to="/pedido" style={{ marginRight: 10 }}>Gerar QR do Pedido</Link>
        <Link to="/leitor">Leitor de QR</Link>
      </nav>
      <Routes>
        <Route path="/" element={<OrderCake />} />
        <Route path="/list" element={<ListOrder />} />
      </Routes>
    </Router>
  );
}

export default App;
