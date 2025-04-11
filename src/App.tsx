import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/routes/ProtectedRoute';

function App() {
    return (
        <>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </>
    );
}

export default App;
