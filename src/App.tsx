import { Routes, Route } from "react-router-dom";

import Home from './pages/Home';
import Register from './pages/Register';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <>
      <h1>PhotoComp</h1>
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<UserManagement />} />

        </Route>
      </Routes>
    </>
  );
}

export default App;