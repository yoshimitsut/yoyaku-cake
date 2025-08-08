import { useState } from 'react';
import cakesData from '../data/cake.json';
// import { QRCodeCanvas } from "qrcode.react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ja } from 'date-fns/locale';
import Select from 'react-select';
import type { StylesConfig, GroupBase } from 'react-select';

import {
  addDays,
  endOfMonth,
  isAfter,
  isSameDay,
} from "date-fns";

const API_URL = import.meta.env.VITE_API_URL;

const cakeOptions = cakesData.cakes;

type CakeOrder = {
  cake: string; 
  quantity: string;
  size: string;
};

type OptionType = {
  value: string;
  label: string;
};

function OrderCake() {

//Teste de calendario
const today = new Date();
const diasABloquear = 3;

// Bloqueia os próximos 3 dias a partir de hoje
const gerarDiasBloqueadosInicio = () => {
  const datas = [];
  let data = today;
  while (datas.length < diasABloquear) {
    datas.push(data);
    data = addDays(data, 1);
  }
  return datas;
};

// Agora definimos dias com mês específico para bloquear
const diasEspecificosPorMes = [
  { day: 9, month: 7 },  // 9 de agosto (mês 7)
  { day: 19, month: 7 }, // 19 de agosto
  { day: 25, month: 7 }, // 25 de agosto
  { day: 9, month: 8 },  // 9 de setembro
  { day: 19, month: 8 }, // 19 de setembro
  { day: 25, month: 8 }, // 25 de setembro
];

// Gera datas completas a partir dos pares de dia e mês, somente se forem no futuro
const gerarDatasEspecificasComMes = () => {
  const datas: Date[] = [];

  diasEspecificosPorMes.forEach(({ day, month }) => {
    const date = new Date(today.getFullYear(), month, day);
    if (isAfter(date, today)) {
      datas.push(date);
    }
  });

  return datas;
};

const excludedDates = [
  ...gerarDiasBloqueadosInicio(),
  ...gerarDatasEspecificasComMes(),
];

const isDateAllowed = (date: Date) =>
  !excludedDates.some((d) => isSameDay(d, date));

const maxDate = endOfMonth(addDays(today, 31));

const [selectedDate2, setSelectedDate2] = useState<Date | null>(null);


  //Até aqui

  const [isSubmitting, setIsSubmitting] = useState(false);

  // const [orderId, setOrderId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [cakes, setCakes] = useState<CakeOrder[]>([
    { cake: String(cakeOptions[0].id_cake) , quantity: "1", size: "" },
  ]);
  
  const [pickupHour, setPickupHour] = useState("11~13時");

  const hoursOptions = [
    { value: "11~13時", label: "11~13時" },
    { value: "13~17時", label: "13~17時" },
    { value: "17~19時", label: "17~19時" },
  ];

  const quantityOptions = Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1} 個`,
  }));

  const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#FF7F50' : '#ccc',
      boxShadow: 'none',
      border: '1px solid #000',
      borderRadius: '10px',
      paddingTop: '10px',
      paddingBottom: '10px',
      '&:hover': {
        borderColor: '#FF7F50',
      },
    }),
  }
  
  const addCake = () => {
    const defaultCake = cakeOptions[0];
    const defaultSize = Array.isArray(defaultCake.size)
      ? defaultCake.size[0]
      : defaultCake.size;

    const newCake: CakeOrder = {
      cake: String(defaultCake.id_cake),
      size: defaultSize,
      quantity: "1",
    }

    setCakes((prevCakes) => [...prevCakes, newCake]);
  };

  // const updateCakeSize = (index: number, value: string)=> {
  //   const newCakes = [...cakes];
  //   newCakes[index].size = value;
  //   setCakes(newCakes);
  // }

  const updateCake = (index: number, field: keyof CakeOrder, value: string) => {
    const newCakes = [...cakes];
    if (field === 'cake') {
      newCakes[index].cake = value;
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
      pickupHour: (document.getElementById("hours") as HTMLSelectElement).value,
      message: (document.getElementById("message") as HTMLTextAreaElement).value,
      cakes: cakes.map(c => {
        const cakeData = cakeOptions.find(cake => Number(cake.id_cake) === Number(c.cake));
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
        <h2>クリスマスケーキ予約フォーム</h2>

        <form className='form-order' onSubmit={handleSubmit}>
          <div className='cake-information'>
            {cakes.map((item, index) => {
              const selectedCake = cakeOptions.find(cake => cake.id_cake === Number(item.cake));
              // const sizes = selectedCake ? Array.isArray(selectedCake.size)
              //                             ? selectedCake.size
              //                             : [selectedCake.size]
              //                           : [];
              return(
                <div className='box-cake' key={index}>
                  {item.cake !== "0" && (
                    <img
                      style={{ width: '350px', paddingBottom: '20px' }}
                      src={cakeOptions.find((cake) => Number(cake.id_cake) === Number(item.cake))?.image}
                      alt={cakeOptions.find((cake) => Number(cake.id_cake) === Number(item.cake))?.name || "ケーキ"}
                    />
                  )}
                  <div className='input-group'>
                    <Select
                      options={cakeOptions.map(c => ({
                        value: String(c.id_cake),
                        label: String(c.name),
                        className: 'teste'
                      }))}
                      value={cakeOptions.find(c => Number(c.id_cake) === Number(item.cake))
                        ? { value: item.cake, label: selectedCake?.name || "" }
                        : null}
                      onChange={(selected) => updateCake(index, "cake", String(selected?.value))}
                      classNamePrefix="react-select"
                      placeholder="ケーキを選択"
                      styles={customStyles} 
                      required
                      />
                      <label className='select-group'>*ケーキ名:</label>
                  </div>
                  
                  <div className='input-group'>
                    {selectedCake?.size && (
                      <Select
                      options={(Array.isArray(selectedCake.size) ? selectedCake.size : [selectedCake.size])
                        .map(size => ({ value: size, label: size }))}
                        value={item.size ? { value: item.size, label: item.size } : null}
                        onChange={(selected) => updateCake(index, "size", selected?.value || "")}
                      classNamePrefix="react-select"
                      placeholder="サイズを選択"
                      styles={customStyles} 
                      required
                      />
                    )}
                    <label className='select-group'>*ケーキのサイズ</label>
                  </div>

                  <div className='input-group'>
                    <Select
                      options={quantityOptions}
                      value={quantityOptions.find(q => q.value === item.quantity)}
                      onChange={(selected) => updateCake(index, "quantity", selected?.value || "1")}
                      classNamePrefix="react-select"
                      className="select-cake"
                      placeholder="数量"
                      styles={customStyles}
                      />
                      <label className='select-group'>*個数:</label>
                  </div>
                </div>
              );
            })}
            <div className='btn-div'>
              <button type='button' className='btn' onClick={addCake}>＋ 別のケーキを追加</button>
            </div>
          </div>

          <div className='client-information'>
            <label htmlFor="full-name" className='title-information'>お客様情報</label>
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
            <label className='title-information'>*受取日 / その他</label>
            <div className='input-group'>
              <label className='reciver-day'>*受け取り希望日</label>
              <DatePicker 
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                dateFormat="yyyy年MM月dd日"
                minDate={new Date(2025, 11, 21)}
                maxDate={new Date(2025, 11, 25)}
                placeholderText="日付を選択"
                className="react-datepicker"
                locale={ja}
                calendarClassName="datepicker-calendar"
                
              />

            </div>
    <label className='reciver-day'>*Calendário teste</label>        
<DatePicker
      selected={selectedDate2}
      onChange={(date) => setSelectedDate2(date)}
      minDate={today}
      maxDate={maxDate}
      excludeDates={excludedDates}
      filterDate={isDateAllowed}
      dateFormat="yyyy年MM月dd日"
      locale={ja}
      placeholderText="日付を選択"
      dayClassName={(date) => isSameDay(date, today) ? "hoje-azul" : ""}
/>


            <div className='input-group'>
              <Select
                inputId="pickupHour"
                options={hoursOptions}
                value={hoursOptions.find(h => h.value === pickupHour)}
                onChange={(selected) => setPickupHour(selected?.value || "11~13時")}
                classNamePrefix="react-select"
                styles={customStyles}
              /> 
              <label htmlFor="pickupHour" className='select-group'>受け取り希望時間</label>
            </div>

            <div className='input-group'>
              <label htmlFor="message">その他</label>
              <textarea id="message" className='message' placeholder="メッセージプレートの内容など"></textarea>
            </div>  
          </div>
          

          <div className='btn-div'>
            <button type="submit" className='send btn' disabled={isSubmitting}>
              {isSubmitting ? "送信中..." : "送信"}
            </button>
          </div>
          
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
