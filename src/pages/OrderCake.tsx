import { useState } from 'react';
import cakesData from '../data/cake.json';
import { QRCodeCanvas } from "qrcode.react";

const API_URL = import.meta.env.VITE_API_URL;

const cakeOptions = cakesData.cakes;

type CakeOrder = {
  cake: number; 
  quantity: string;
};

function OrderCake() {
  const [orderId, setOrderId] = useState<number | null>(null);

  const [cakes, setCakes] = useState<CakeOrder[]>([
    { cake: 0, quantity: "1" },
  ]);

  const addCake = () => {
    setCakes([...cakes, { cake: 0, quantity: "1" }]);
  };

  const updateCake = (index: number, field: keyof CakeOrder, value: string) => {
    const newCakes = [...cakes];
    if (field === 'cake') {
      newCakes[index].cake = parseInt(value);
    } else {
      newCakes[index][field] = value;
    }
    setCakes(newCakes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const telInput = (document.getElementById("tel") as HTMLInputElement).value
    const tel = telInput.replace(/\D/g, '');
    const id_client = tel.slice(-4);
    
    const data = {
      // id_client: Math.random().toString(36).substring(2, 8),
      id_client,
      first_name: (document.getElementById("firstname") as HTMLInputElement).value,
      last_name: (document.getElementById("lastname") as HTMLInputElement).value,
      email: (document.getElementById("email") as HTMLInputElement).value,
      tel,
      date: (document.getElementById("date") as HTMLSelectElement).value,
      hour: (document.getElementById("hours") as HTMLSelectElement).value,
      message: (document.getElementById("message") as HTMLTextAreaElement).value,
      cakes: cakes.map(c => {
        const cakeData = cakeOptions.find(cake => cake.id_cake === c.cake);
        return {
          ...cakeData,
          amount: parseInt(c.quantity)
        };
      })
    };


    try {
      console.log(`${API_URL}/api/reserva`);
      const res = await fetch(`${API_URL}/api/reserva`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        console.log(`${API_URL}/api/reserva`);
        setOrderId(result.id); // armazena o id do pedido
        alert(`送信が完了しました！受付番号: ${result.id}${API_URL}`);
      }

    } catch (error) {
      alert("送信に失敗しました。");
      console.error(error);
    }
  };


  return (
    <div className='reservation-main'>
      <div className='container'>
        <h2>クリスマスケーキ予約フォーム</h2>

        <form className='form-order' onSubmit={handleSubmit}>
          <div className='full-name'>
            <div className='name-label'>
              <label htmlFor="firstname">*姓(カタカナ)</label>
              <input id="firstname" name="firstname" type="text" placeholder='ヒガ' />
            </div>
            <div className='name-label'>
              <label htmlFor="lastname">*名(カタカナ)</label>
              <input id="lastname" name="lastname" type="text" placeholder='タロウ' />
            </div>
          </div>

          <label htmlFor="email">*メールアドレス</label>
          <input type="email" name="email" id="email" placeholder='必須'/>

          <label htmlFor="tel">*お電話番号</label>
          <input type="text" name="tel" id="tel" placeholder='ハイフン不要' />
  
          {cakes.map((item, index) => (
            
            <div className='box-cake' key={index}>
              {item.cake !== 0 && (
                <img
                  style={{ width: '200px' }}
                  src={cakeOptions.find((cake) => cake.id_cake === item.cake)?.image}
                  alt={cakeOptions.find((cake) => cake.id_cake === item.cake)?.name || "ケーキ"}
                />
              )}

              <label>ケーキの種類:</label>
              <select
                value={item.cake}
                onChange={(e) => updateCake(index, "cake", e.target.value)}
                required
              >
                <option value={0} disabled>ケーキを選択</option>
                {cakeOptions.map((cake) => (
                  <option key={cake.id_cake} value={cake.id_cake}>{cake.name}</option>
                ))}
              </select>

              <label>個数:</label>
              <select
                value={item.quantity}
                onChange={(e) => updateCake(index, "quantity", e.target.value)}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={String(num)}>{num}</option>
                ))}
              </select>
            </div>
          ))}

          <button type='button' className='btn' onClick={addCake}>＋ ケーキを追加</button>

          <select id="date" className='date'>
            {["12月21日（土）","12月22日（日）","12月23日（月）","12月24日（火）","12月25日（水）"].map((d, i) => (
              <option key={i} value={d}>{d}</option>
            ))}
          </select>

          <select id="hours" className='hours'>
            {["11~13時","13~17時","17~19時"].map((h, i) => (
              <option key={i} value={h}>{h}</option>
            ))}
          </select>

          <textarea id="message" className='message' placeholder="メッセージプレートの内容など"></textarea>

          <button type="submit" className='send btn'>送信</button>
          {orderId && (
            <div style={{ marginTop: 20 }}>
              <h3>QRコード:</h3>
              <QRCodeCanvas value={String(orderId)} size={200} />
              <p>ID: {orderId}</p>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}

export default OrderCake;
