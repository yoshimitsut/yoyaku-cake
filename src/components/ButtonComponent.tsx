import React from "react";
import styles from './ButtonComponent.module.css';

interface ButtonProps {
  text: string;
  type?: 'button' | 'submit'
  onClick?: () => void;
}

const ButtonComponent: React.FC<ButtonProps> = ({ text, type = 'button', onClick }) => {
  return (
    <button className={styles.btn}type={type} onClick={onClick} >
      {text}
    </button>
  )
}

export default ButtonComponent