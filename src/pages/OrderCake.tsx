import { useState } from 'react';
import cakesData from '../data/cake.json';
// import { QRCodeCanvas } from "qrcode.react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = import.meta.env.VITE_API_URL;

const cakeOptions = cakesData.cakes;

type CakeOrder = {
  cake: number; 
  quantity: string;
  size: string;
};

function OrderCake() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const [orderId, setOrderId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [cakes, setCakes] = useState<CakeOrder[]>([
    { cake: cakeOptions[0].id_cake , quantity: "1", size: "" },
  ]);

  const addCake = () => {
    const defaultCake = cakeOptions[0];
    const defaultSize = Array.isArray(defaultCake.size)
      ? defaultCake.size[0]
      : defaultCake.size;

    const newCake: CakeOrder = {
      cake: defaultCake.id_cake,
      size: defaultSize,
      quantity: "1",
    }

    setCakes((prevCakes) => [...prevCakes, newCake]);
  };

  const updateCakeSize = (index: number, value: string)=> {
    const newCakes = [...cakes];
    newCakes[index].size = value;
    setCakes(newCakes);
  }

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
    setIsSubmitting(true);
    
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
      // date: (document.getElementById("date") as HTMLSelectElement).value,
      date: selectedDate?.toISOString().split('T')[0] || "",
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
      const res = await fetch(`${API_URL}/api/reserva`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        // setOrderId(result.id); // armazena o id do pedido
        alert(`送信が完了しました！受付番号: ${result.id}`);
      }

    } catch (error) {
      alert("送信に失敗しました。");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className='reservation-main'>
      <div className='container'>
        <h1>クリスマスケーキ予約フォーム</h1>

        <form className='form-order' onSubmit={handleSubmit}>

          <div className='cake-information'>
            {cakes.map((item, index) => {
              const selectedCake = cakeOptions.find(cake => cake.id_cake === Number(item.cake));
              const sizes = selectedCake ? Array.isArray(selectedCake.size)
                                          ? selectedCake.size
                                          : [selectedCake.size]
                                        : [];
              return(
                <div className='box-cake' key={index}>
                  {item.cake !== 0 && (
                    <img
                      style={{ width: '350px' }}
                      src={cakeOptions.find((cake) => cake.id_cake === item.cake)?.image}
                      alt={cakeOptions.find((cake) => cake.id_cake === item.cake)?.name || "ケーキ"}
                    />
                  )}
                  <div className='input-group'>
                    <label className='title-cake-name'>ケーキの名:</label>
                    <select
                      value={item.cake}
                      onChange={(e) => updateCake(index, "cake", e.target.value)}
                      required
                    >
                      <option value={0} disabled></option>
                      {cakeOptions.map((cake) => (
                        <option key={cake.id_cake} value={cake.id_cake}>{cake.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className='input-group'>
                    <label className='title-cake-size'>ケーキのサイズ</label>
                    <select
                      value={item.size}
                      onChange={(e) => updateCakeSize(index, e.target.value)}
                      disabled={!item.cake}
                      required
                    >
                      <option value="">サイズを選択</option>
                      {sizes.map((s, i) => (
                        <option key={i} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className='input-group'>
                    <label className='title-cake-quantity'>個数:</label>
                    <select
                      value={item.quantity}
                      onChange={(e) => updateCake(index, "quantity", e.target.value)}
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={String(num)}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
            <button type='button' className='btn' onClick={addCake}>＋ 別のケーキを追加</button>
          </div>

          <div className='client-information'>
            <div className='full-name'>
              <div className='name-label input-group'>
                <label htmlFor="firstname">*姓(カタカナ)</label>
                <input id="firstname" name="firstname" type="text" placeholder='ヒガ' />
              </div>
              <div className='name-label input-group'>
                <label htmlFor="lastname">*名(カタカナ)</label>
                <input id="lastname" name="lastname" type="text" placeholder='タロウ' />
              </div>
            </div>
            
            <div className='input-group'>
              <label htmlFor="email">*メールアドレス</label>
              <input type="email" name="email" id="email" placeholder='必須'/>
            </div>

            <div className='input-group'>
              <label htmlFor="tel">*お電話番号</label>
              <input type="text" name="tel" id="tel" placeholder='ハイフン不要' />
            </div>
          </div>
          
          <div className='date-information'>
            <div className='input-group reciver-day-group'>
              <label className='reciver-day'>*受取日</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                dateFormat="yyyy-MM-dd"
                minDate={new Date(2025, 11, 21)} // mês 11 = dezembro
                maxDate={new Date(2025, 11, 25)}
                placeholderText="日付を選択"
                className="date"
              />

              <select id="hours" className='hours'>
                {["11~13時","13~17時","17~19時"].map((h, i) => (
                  <option key={i} value={h}>{h}</option>
                ))}
              </select>

            </div>

            <div className='input-group'>
              <label htmlFor=" ">その他</label>
              <textarea id="message" className='message' placeholder="メッセージプレートの内容など"></textarea>
            </div>  
          </div>
          
          <button type="submit" className='send btn' disabled={isSubmitting}>
            {isSubmitting ? "送信中..." : "送信"}
          </button>
          
          {/* {orderId && (
            <div style={{ marginTop: 20 }}>
              <h3>QRコード:</h3>
              <QRCodeCanvas value={String(orderId)} size={400} />
              <p>ID: {orderId}</p>
            </div>
          )} */}

        </form>
      </div>
    </div>
  );
}

export default OrderCake;
