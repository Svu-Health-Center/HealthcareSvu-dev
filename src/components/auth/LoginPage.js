import React, { useState, useContext } from "react";
import { Link } from "react-router-dom"; // <-- IMPORT LINK
import { AuthContext } from "../../context/AuthContext";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
// ... other code ...
const LoginPage = () => {
  // ... state and handlers ...
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center bg-light"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "450px" }}>
        <Card className="shadow-lg">
          <Card.Body className="p-5">
            {/* ... title and other form elements ... */}
            <div className="text-center mb-4">
              <h2 className="mb-1">SVU MEDICARE</h2>
              <p className="text-muted">Please sign in to continue</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              {/* ... username and password fields ... */}
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </Form.Group>

              {/* --- ADD THE LINK HERE --- */}
              <div className="text-end mb-3">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
              {/* ------------------------- */}

              <div className="d-grid">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Log In"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default LoginPage;
