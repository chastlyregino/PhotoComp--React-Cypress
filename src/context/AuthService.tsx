import { noAuthInstance } from '../util/axios';

export const registerUser = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}) => {
    return noAuthInstance.post('/api/auth/register', data);
};

export const loginUser = async (data: { email: string; password: string }) => {
    return noAuthInstance.post('/api/auth/login', data);
};
