import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Login from "../src/pages/Register"
import { loginUser } from "../src/context/AuthService";

jest.mock("../src/context/AuthService.tsx", () => ({
  loginUser: jest.fn(),
}));

describe("Register Component", () => {
  let consoleErrorMock: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => { });
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
  })


  test("renders form fields", () => {
    render(<Login />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("shows an error when fields are empty", async () => {
    render(<Login />);

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/please fill in all fields/i)).toBeInTheDocument();
  })

  test("call loginUser api on form submit", async () => {
    render(<Login />);
    const email = "test@example.com";
    const password = "1234567890";

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: email } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } })

    fireEvent.click(screen.getByRole("button", { name: /login/i }))

    await waitFor(() => expect(loginUser).toHaveBeenCalledWith({
      email: email,
      password: password,
    }))
  })

  test("shows error message on failed login", async () => {
    (loginUser as jest.Mock).mockRejectedValue("mocked error");

    render(<Login />);

    const email = "test@example.com";
    const password = "1234567890";

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: email } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } })

    fireEvent.click(screen.getByRole("button", { name: /login/i }))

    expect(await screen.findByText(/registration failed./i)).toBeInTheDocument()
  })

})



