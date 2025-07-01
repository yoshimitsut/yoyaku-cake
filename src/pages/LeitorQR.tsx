// PaginaLeitorQR.tsx
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

type Pedido = {
  id_order: number;
  id_client: string;
  first_name: string;
  last_name: string;
  secret_key: string;
};

export default function PaginaLeitorQR() {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [erro, setErro] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!qrRef.current) return;

    const html5QrCode = new Html5Qrcode(qrRef.current.id);
    scannerRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            if (data.secret_key === 'meuSistema123') {
              setPedido(data);
              setErro('');
              html5QrCode.stop(); // Para o scanner após leitura válida
            } else {
              setErro('QR Code inválido ou não autorizado.');
              setPedido(null);
            }
          } catch (e) {
            setErro('Erro ao interpretar o QR Code.');
            setPedido(null);
          }
        },
        (errorMessage) => {
          // erros de leitura podem ser ignorados
        }
      )
      .catch((err) => {
        console.error(err);
        setErro('Erro ao iniciar o leitor.');
      });

    return () => {
      html5QrCode.stop().catch(() => {});
    };
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Leitor de QR Code</h2>
      <div id="qr-reader" ref={qrRef} style={{ width: 300, marginBottom: 20 }} />

      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      {pedido && (
        <div>
          <h3>Pedido encontrado</h3>
          <pre>{JSON.stringify(pedido, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
