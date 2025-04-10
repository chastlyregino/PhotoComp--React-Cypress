import { useContext, useState, useEffect, ReactNode } from 'react';
import AuthContext, { User } from './AuthContext';

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const context = useContext(AuthContext);

    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            context?.setUser(JSON.parse(storedUser));
            context?.setToken(storedToken);
        }
    }, [context]);

    const logout = () => {
        context?.setUser(null);
        context?.setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, setUser, setToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
