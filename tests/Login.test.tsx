import { fireEvent, screen, waitFor } from '@testing-library/react';
import Login from '../src/pages/Login'; // Fixed the import to use Login instead of Register
import { loginUser } from '../src/context/AuthService';
import { renderWithRouter } from './utils/test-utils';

jest.mock('../src/context/AuthService', () => ({
    loginUser: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
    let consoleErrorMock: jest.SpyInstance;

    beforeEach(() => {
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockNavigate.mockClear();
    });

    afterEach(() => {
        consoleErrorMock.mockRestore();
        jest.clearAllMocks();
    });

    test('renders form fields', () => {
        renderWithRouter(<Login />);

        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('shows an error when fields are empty', async () => {
        renderWithRouter(<Login />);

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(await screen.findByText(/please fill in all fields/i)).toBeInTheDocument();
    });

    test('calls loginUser api on form submit', async () => {
        const mockResponse = {
            data: {
                data: {
                    token: 'test-token',
                    user: { id: 1, email: 'test@example.com' },
                },
            },
        };

        (loginUser as jest.Mock).mockResolvedValue(mockResponse);

        renderWithRouter(<Login />);
        const email = 'test@example.com';
        const password = '1234567890';

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: email } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() =>
            expect(loginUser).toHaveBeenCalledWith({
                email: email,
                password: password,
            })
        );

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
    });

    test('shows error message on failed login', async () => {
        (loginUser as jest.Mock).mockRejectedValue(new Error('mocked error'));

        renderWithRouter(<Login />);

        const email = 'test@example.com';
        const password = '1234567890';

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: email } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(await screen.findByText(/login failed./i)).toBeInTheDocument();
    });
});
