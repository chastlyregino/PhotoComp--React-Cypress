import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import Organizations from './pages/Organizations/ViewOrganizations';
import ProtectedRoute from './components/routes/ProtectedRoute/ProtectedRoute';
import Footer from './components/bars/Footer/Footer';

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
                <Route
                    path="/organizations"
                    element={
                        <ProtectedRoute>
                            <Organizations />
                        </ProtectedRoute>
                    }
                />
            </Routes>
            <Footer />
        </>
    );
}

export default App;
