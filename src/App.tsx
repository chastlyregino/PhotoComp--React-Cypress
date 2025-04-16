import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home/Home';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import Members from './pages/Members/Members'
import Membership from './pages/Membership/Membership'
import Organizations from './pages/Organizations/ViewOrganizations';
import SingleEvents from './pages/Events/SingleEvents';
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
                <Route path="/events" element={<Events/>} />
                <Route
                    path="/organizations/create"
                    element={
                        <ProtectedRoute>
                            <CreateOrganization />
                        </ProtectedRoute>
                    }
                />
                <Route path="/organizations/:id/events" element={<SingleEvents />} />
                <Route path="/account-settings" element={<AccountSettings/>} />
                 <Route
                    path="/organizations/:orgId/members/requests"
                    element={
                        <ProtectedRoute>
                            <Membership />
                        </ProtectedRoute>
                    }
                />
                 <Route
                    path="/organizations/:orgId/members"
                    element={
                        <ProtectedRoute>
                            <Members />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/organizations/:id/events/:eid/photos"
                    element={
                        <ProtectedRoute>
                            <Photos />
                        </ProtectedRoute>
                    }
                />
            </Routes>
            <Footer />
        </>
    );
}

export default App;
