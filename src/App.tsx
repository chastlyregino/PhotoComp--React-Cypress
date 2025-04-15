import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import Organizations from './pages/Organizations/ViewOrganizations';
import Events from './pages/Events/ViewEvents';
import Photos from './pages/Photos/viewPhotos';
import ProtectedRoute from './components/routes/ProtectedRoute/ProtectedRoute';
import Footer from './components/bars/Footer/Footer';
import AccountSettings from './pages/AccountSettings/AccountSettings';
import CreateOrganization from './pages/Organizations/CreateOrganization/CreateOrganization';



function App() {
    return (
        <>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Home />} />
                <Route path="/organizations" element={<Organizations />} />
                <Route
                    path="/organizations/create"
                    element={
                        <ProtectedRoute>
                            <CreateOrganization />
                        </ProtectedRoute>
                    }
                />
                <Route path="/organizations/:id/events" element={<Events />} />
                <Route
                    path="/account-settings"
                    element={
                        <ProtectedRoute>
                            <AccountSettings />
                        </ProtectedRoute>
                    }
                />
                <Route 
                    path="/organizations/:id/events/:eid"
                    element={
                        <Photos />
                    }
                />
            </Routes>
            <Footer />
        </>
    );
}

export default App;