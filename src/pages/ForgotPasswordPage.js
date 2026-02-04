import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import api from "../api/api";
const FRONTEND_URL = "http://localhost:3000";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.msg);

      // In our simulation, we get the token back to create the link
      if (res.data.simulatedResetToken) {
        console.log(
          `Password reset link: ${FRONTEND_URL}/reset-password/${res.data.simulatedResetToken}`
        );
      }
    } catch (err) {
      setError(err.response?.data?.msg || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "80vh" }}
    >
      <div className="w-100" style={{ maxWidth: "450px" }}>
        <Card className="shadow-lg">
          <Card.Body className="p-5">
            <h2 className="text-center mb-4">Forgot Password</h2>
            <p className="text-center text-muted mb-4">
              Enter your email and we'll send you instructions to reset your
              password.
            </p>

            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </Form.Group>

              <div className="d-grid">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </div>

              <div className="text-center mt-3">
                <Link to="/login">Back to Login</Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default ForgotPasswordPage;
