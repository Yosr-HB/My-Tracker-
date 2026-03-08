import * as React from "react";
import { Link } from "react-router-dom";
import '../styles/main.css';
import NavBar from "./NavBar";

const Home: React.FC = () => {
  return (
    <div>
      <NavBar />
      <div className="container">
        <h1 className="title">Hello, React!</h1>
        <p className="description">Welcome to your React application</p>
        <div className="button-container">
          <Link to="/tracker" className="primary-button">
            Go to Task Tracker
          </Link>
          <Link to="/me" className="secondary-button">
            Go to /me page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;