import * as React from "react";
import { useState, Activity } from "react";
import { Link } from "react-router-dom";
import '../styles/main.css';
import NavBar from "./NavBar";
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomButton from "./Button";
interface CustomButtonProps {
  buttonStyles: string;
  onClick: () => void;
}

let visibility: "hidden" | "visible" = 'hidden';

const Me: React.FC = () => {
  const [alert, setAlerts] = useState(false);
  const sendValueHandler = async (status: boolean) => {
    setAlerts(status);
    try {
      const response = await fetch("http://localhost:8000/save-value", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "value":alert }),
      });

      if (!response.ok) {
        throw new Error("Failed to save value");
      }
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.log("Error:", error);
    }
  };
  return (
    <>
      <NavBar />
      <div className="container">
        <h1 className="title" onClick={() => { console.log('tototot') }}>Hello this is Yoss</h1>
        <p className="description">Welcome to the test page!</p>
        <div className="button-container">
          <Link to="/" className="primary-button">
            Go to Home
          </Link>
          <Link to="/tracker" className="secondary-button">
            Go to Task Tracker
          </Link>
        </div>
        
        <Activity mode={alert ? "visible" : "hidden"}>
          <div className="alert alert-primary">
            'Nice, you triggered this alert message!'
            <CustomButton buttonStyles="btn-close" onClick={()=> sendValueHandler(false)}> </CustomButton>
          </div>
        </Activity>
        <CustomButton buttonStyles="btn btn-success" onClick={() => sendValueHandler(true)} >test</CustomButton>
      </div>
    </>
  );
};

export default Me;