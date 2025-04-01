import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Register from "../src/pages/Register"
import { registerUser } from "../src/context/AuthService";

jest.mock("../src/context/AuthService.tsx", () => ({
  registerUser: jest.fn(),
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
    render(<Register />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  test("shows an error when fields are empty", async () => {
    render(<Register />);

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/please fill in all fields/i)).toBeInTheDocument();
  })

  test("call registerUser api on form submit", async () => {
    render(<Register />);
    const email = "test@example.com";
    const password = "1234567890";
    const username = "test1";
    const firstName = "John";
    const lastName = "Doe";

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: email } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } })
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: username } })
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: firstName } })
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: lastName } })

    fireEvent.click(screen.getByRole("button", { name: /register/i }))

    await waitFor(() => expect(registerUser).toHaveBeenCalledWith({
      email: email,
      password: password,
      username: username,
      firstName: firstName,
      lastName: lastName
    }))
  })

  test("shows error message on failed registration", async () => {
    (registerUser as jest.Mock).mockRejectedValue("mocked error");

    render(<Register />);

    const email = "test@example.com";
    const password = "1234567890";
    const username = "test1";
    const firstName = "John";
    const lastName = "Doe";

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: email } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } })
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: username } })
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: firstName } })
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: lastName } })

    fireEvent.click(screen.getByRole("button", { name: /register/i }))

    expect(await screen.findByText(/registration failed./i)).toBeInTheDocument()
  })

})


