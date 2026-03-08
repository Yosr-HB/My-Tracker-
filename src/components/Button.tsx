import * as React from "react";
import { NavLink } from "react-router-dom";
import '../styles/NavBar.css';

interface Props{
  children: string,
  buttonStyles: string,
  onClick(): void,
}
const CustomButton = ({ children, buttonStyles, onClick }: Props) => {
  return (
    <>
      <button type="button" className={buttonStyles} onClick={onClick}>{children}</button>
    </>
  );
};
 
export default CustomButton;