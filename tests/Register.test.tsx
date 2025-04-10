import { fireEvent, screen, waitFor } from '@testing-library/react';
import Register from '../src/pages/Register';
import { registerUser } from '../src/context/AuthService';
import { renderWithRouter } from './utils/test-utils';

jest.mock('../src/context/AuthService', () => ({
    registerUser: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Register Component', () => {
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
        renderWithRouter(<Register />);

        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    test('shows an error when fields are empty', async () => {
        renderWithRouter(<Register />);

        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        expect(await screen.findByText(/please fill in all fields/i)).toBeInTheDocument();
    });

    test('calls registerUser api on form submit', async () => {
        const mockResponse = {
            data: {
                data: {
                    token: 'test-token',
                    user: { id: 1, email: 'test@example.com' },
                },
            },
        };

        (registerUser as jest.Mock).mockResolvedValue(mockResponse);

        renderWithRouter(<Register />);
        const email = 'test@example.com';
        const password = '1234567890';
        const username = 'test1';
        const firstName = 'John';
        const lastName = 'Doe';

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: email } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: username } });
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: firstName } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: lastName } });

        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() =>
            expect(registerUser).toHaveBeenCalledWith({
                email: email,
                password: password,
                username: username,
                firstName: firstName,
                lastName: lastName,
            })
        );

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
    });

    test('shows error message on failed registration', async () => {
        (registerUser as jest.Mock).mockRejectedValue(new Error('mocked error'));

        renderWithRouter(<Register />);

        const email = 'test@example.com';
        const password = '1234567890';
        const username = 'test1';
        const firstName = 'John';
        const lastName = 'Doe';

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: email } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: username } });
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: firstName } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: lastName } });

        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        expect(await screen.findByText(/registration failed./i)).toBeInTheDocument();
    });
});
