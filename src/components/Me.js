import React from "react";
import { Link } from "react-router-dom";
import '../styles/main.css';
import NavBar from "./NavBar";

const Me = () => {
  return (
    <>
      <NavBar />
      <div className="container">
        <h1 className="title">Hello this is Yoshs</h1>
        <p className="description">Welcome to the /me page!</p>
        <div className="button-container">
          <Link to="/" className="primary-button">
            Go to Home
          </Link>
          <Link to="/tracker" className="secondary-button">
            Go to Task Tracker
          </Link>
        </div>
      </div>
    </>
  );
};

export default Me;
