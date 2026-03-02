import React from "react";
import { Link } from "react-router-dom";
import '../styles/NavBar.css';

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <Link to="/" className="logo-link">
            TaskTracker App
          </Link>
        </div>
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/" className="nav-link" activeClassName="active">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/tracker" className="nav-link" activeClassName="active">
              Task Tracker
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/me" className="nav-link" activeClassName="active">
              About Me
            </Link>
          </li>
          <li className="nav-item">
            <a href="http://localhost:5000/swagger" target="_blank" rel="noopener noreferrer" className="nav-link">
              API Docs
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;