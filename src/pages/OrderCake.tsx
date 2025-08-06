import { useState } from 'react';
import cakeData from '../data/cake.json';
import axios from 'axios';
import Select from 'react-select';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ja } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('ja', ja);

const cakeOptions = cakeData.cakes;

const quantityOptions = Array.from({ length: 10 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `${i + 1}個`,
}));

export default function OrderCake() {
  const [cakeList, setCakeList] = useState([{ cake: 0, quantity: "1", size: "" }]);
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [pickupDate, setPickupDate] = useState(new Date());
  const [pickupHour, setPickupHour] = useState("11~13時");
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const hoursOptions = [
    { value: "11~13時", label: "11~13時" },
    { value: "13~17時", label: "13~17時" },
    { value: "17~19時", label: "17~19時" },
  ];

  const updateCake = (index: number, field: string, value: string) => {
    const updated = [...cakeList];
    updated[index] = { ...updated[index], [field]: value };
    setCakeList(updated);
  };

  const addCake = () => {
    setCakeList([...cakeList, { cake: 0, quantity: "1", size: "" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(import.meta.env.VITE_API_URL + '/order', {
        name,
        tel,
        pickupDate,
        pickupHour,
        message,
        cakes: cakeList,
      });
      alert("ご予約ありがとうございます！");
      setName('');
      setTel('');
      setMessage('');
      setPickupDate(new Date());
      setPickupHour("11~13時");
      setCakeList([{ cake: 0, quantity: "1", size: "" }]);
    } catch (error) {
      console.error("送信エラー:", error);
      alert("送信に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className='form-order' onSubmit={handleSubmit}>
      <div className='input-group'>
        <label htmlFor="name">お名前</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className='input-group'>
        <label htmlFor="tel">電話番号</label>
        <input id="tel" value={tel} onChange={(e) => setTel(e.target.value)} required />
      </div>

      <div className='input-group'>
        <label htmlFor="pickupDate">受け取り希望日</label>
        <DatePicker
          id="pickupDate"
          selected={pickupDate}
          onChange={handleDateChange}
          dateFormat="yyyy年MM月dd日"
          locale="ja"
          className="datepicker"
        />
      </div>

      <div className='input-group'>
        <label htmlFor="pickupHour">受け取り希望時間</label>
        <Select
          inputId="pickupHour"
          options={hoursOptions}
          value={hoursOptions.find(h => h.value === pickupHour)}
          onChange={(selected) => setPickupHour(selected?.value || "11~13時")}
          classNamePrefix="react-select"
        />
      </div>

      {cakeList.map((item, index) => {
        const selectedCake = cakeOptions.find(c => c.id_cake === item.cake);

        return (
          <div key={index} className='box-cake'>
            <label>ケーキ{index + 1}</label>

            <Select
              options={cakeOptions.map(c => ({
                value: c.id_cake,
                label: c.name
              }))}
              value={cakeOptions.find(c => c.id_cake === item.cake)
                ? { value: item.cake, label: selectedCake?.name || "" }
                : null}
              onChange={(selected) => updateCake(index, "cake", String(selected?.value))}
              classNamePrefix="react-select"
              placeholder="ケーキを選択"
              required
            />

            {selectedCake?.size && (
              <Select
                options={(Array.isArray(selectedCake.size) ? selectedCake.size : [selectedCake.size])
                  .map(size => ({ value: size, label: size }))}
                value={item.size ? { value: item.size, label: item.size } : null}
                onChange={(selected) => updateCake(index, "size", selected?.value || "")}
                classNamePrefix="react-select"
                placeholder="サイズを選択"
              />
            )}

            <Select
              options={quantityOptions}
              value={quantityOptions.find(q => q.value === item.quantity)}
              onChange={(selected) => updateCake(index, "quantity", selected?.value || "1")}
              classNamePrefix="react-select"
              placeholder="数量"
            />

            {selectedCake?.image && (
              <img src={selectedCake.image} alt={selectedCake.name} />
            )}
          </div>
        );
      })}

      <button type="button" onClick={addCake}>+ ケーキ追加</button>

      <div className='input-group'>
        <label htmlFor="message">その他</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="メッセージプレートの内容など"
        />
      </div>

      <button className="btn" disabled={isSubmitting}>
        {isSubmitting ? "送信中..." : "予約する"}
      </button>
    </form>
  );
}
