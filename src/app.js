import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Home component
const Home = () => {
  return (
    <div>
      <h1>Hello, React!</h1>
      <p>Go to <Link to="/me">/me</Link> to see TOTOT</p>
    </div>
  );
};

// Me component
const Me = () => {
  return (
    <div>
      <h1>Hello this is Yosr's project</h1>
      <p>Welcome to the /me page!</p>
      <p><Link to="/">Go back to home</Link></p>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/me" element={<Me />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
