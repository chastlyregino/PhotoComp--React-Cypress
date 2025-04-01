import { Routes, Route } from "react-router-dom";

import Home from './pages/Home';
import Register from './pages/Register';

function App() {
  return (
    <>
      <h1>PhotoComp</h1>
      <Routes>
        <Route path="/register" element={<Register />} />
        {/* Protect this route */}
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
