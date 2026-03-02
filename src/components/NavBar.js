import React from "react";
import { NavLink } from "react-router-dom";
import '../styles/NavBar.css';

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <NavLink to="/" className="logo-link">
            TaskTracker App
          </NavLink>
        </div>
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink to="/" className="nav-link" end>
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/tracker" className="nav-link">
              Task Tracker
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/me" className="nav-link">
              About Me
            </NavLink>
          </li>
          <li className="nav-item">
            <a href="http://localhost:5000/swagger" target="_blank" rel="noopener noreferrer" className="nav-link">
              API Docs
            </a>
          </li>
          <li className="nav-item">
            <NavLink to="/hierarchy" className="nav-link">
              Task Hierarchy
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
