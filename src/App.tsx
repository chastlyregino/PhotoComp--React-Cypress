import { Routes, Route } from "react-router-dom";

import Home from './pages/Home';
import Register from './pages/Register';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';

function App() {
  return (
    <>
      <h1>PhotoComp</h1>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<UserManagement />} />
        {/* Protect this route */}
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;