import { useState } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";


const Register: React.FC<{}> = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError(null);
    // Meeting playground: Fetch
    console.log("Logging in: ", { email, password });
    return;
  }

  return (<>
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="text-center">Register</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>

            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  </>);

}

export default Register;
