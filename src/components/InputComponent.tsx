import React from 'react';
import './InputComponent.module.css';

interface InputProps {
  label: string;
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

const InputComponent: React.FC<InputProps> = ({
  label,
  id,
  name,
  type = 'text',
  placeholder = '',
  required = false,
}) => {
  return (
    <div>
      <label htmlFor="id">{label}</label>
      <input 
        id={id}
        name={name}
        type={type}
        placeholder={placeholder} 
        required={required}
        />
    </div>
  )
};

export default InputComponent;