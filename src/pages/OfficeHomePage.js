import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Button,
  Card,
  Col,
  Row,
  Alert,
  Tab,
  Nav,
  Table,
  Accordion,
} from "react-bootstrap";
import {
  addMedicineToStock,
  getAllMedicines,
  getAllLabTests,
  addLabTest,
  getDailyVisitReport,
  getDailyMedicineReport,
  getDailyLabTestReport,
} from "../api/apiService";
import { useSocket } from "../context/SocketContext";
import Spinner from "../components/common/Spinner";

// --- Tab for Managing Medicines (with corrected validation logic) ---
const ManageStockTab = () => {
  const socket = useSocket();
  const initialState = { name: "", supplier_info: "", stock: "" };
  const [formData, setFormData] = useState(initialState);
  const [allMedicines, setAllMedicines] = useState([]);

  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);
  const fetchMedicines = useCallback(async () => {
    try {
      setListLoading(true);
      const res = await getAllMedicines();
      setAllMedicines(res.data);
    } catch (err) {
      setError("Failed to fetch medicine list.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  useEffect(() => {
    if (!socket) return;
    socket.on("inventoryUpdate", fetchMedicines);
    return () => {
      socket.off("inventoryUpdate", fetchMedicines);
    };
  }, [socket, fetchMedicines]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true); // Turn validation on only if submission fails
      return;
    }

    // This part only runs if the form is valid
    setLoading(true);
    setMessage("");
    setError("");
    try {
      // await addMedicineToStock(formData);
      const res = await addMedicineToStock(formData);
      setMessage(res.data.msg);
      setFormData(initialState);
      fetchMedicines();
      setValidated(false); // Reset validation state for the next use
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to add medicine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row>
      <Col md={5}>
        <h4>Add New Batch / Update Stock</h4>
        <hr />
        {message && (
          <Alert variant="success" onClose={() => setMessage("")} dismissible>
            {message}
          </Alert>
        )}
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Medicine Name*</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a medicine name.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Quantity to Add*</Form.Label>
            <Form.Control
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="1"
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid, positive quantity.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Supplier Info</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="supplier_info"
              value={formData.supplier_info}
              onChange={handleChange}
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add to Stock"}
          </Button>
        </Form>
      </Col>
      <Col md={7}>
        <h4>Current Medicine Inventory</h4>
        <hr />
        {listLoading ? (
          <Spinner />
        ) : (
          <Accordion alwaysOpen>
            {allMedicines.map((med, index) => (
              <Accordion.Item eventKey={index.toString()} key={med.id}>
                <Accordion.Header>
                  <div className="d-flex justify-content-between w-100 me-2">
                    <span>{med.name}</span>
                    <span
                      className={`fw-bold ${
                        med.totalStock <= 10
                          ? "text-danger"
                          : med.totalStock <= 50
                          ? "text-warning"
                          : ""
                      }`}
                    >
                      Total Stock: {med.totalStock}
                    </span>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Batch ID</th>
                        <th>Supplier</th>
                        <th>Qty Remaining</th>
                        <th>Date Received</th>
                      </tr>
                    </thead>
                    <tbody>
                      {med.batches.map((batch) => (
                        <tr key={batch.id}>
                          <td>{batch.id}</td>
                          <td>{batch.supplier_info || "N/A"}</td>
                          <td>{batch.quantity_remaining}</td>
                          <td>
                            {new Date(batch.received_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Col>
    </Row>
  );
};

// --- Tab for Managing Lab Tests (with corrected validation logic) ---
const ManageLabTestsTab = () => {
  const socket = useSocket();
  const [testName, setTestName] = useState("");
  const [allLabTests, setAllLabTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);
  const fetchLabTests = useCallback(async () => {
    try {
      setListLoading(true);
      const res = await getAllLabTests();
      setAllLabTests(res.data);
    } catch (err) {
      setError("Failed to fetch lab test list.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabTests();
  }, [fetchLabTests]);

  useEffect(() => {
    if (!socket) return;
    socket.on("labTestListUpdate", fetchLabTests);
    return () => {
      socket.off("labTestListUpdate", fetchLabTests);
    };
  }, [socket, fetchLabTests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true); // Turn validation on only if submission fails
      return;
    }

    // This part only runs if the form is valid
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await addLabTest({ name: testName });
      setMessage(res.data.msg);
      setTestName("");
      fetchLabTests();
      setValidated(false); // Reset validation state for the next use
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to add lab test.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row>
      <Col md={5}>
        <h4>Add New Lab Test</h4>
        <hr />
        {message && (
          <Alert variant="success" onClose={() => setMessage("")} dismissible>
            {message}
          </Alert>
        )}
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>New Lab Test Name*</Form.Label>
            <Form.Control
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a lab test name.
            </Form.Control.Feedback>
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Lab Test"}
          </Button>
        </Form>
      </Col>
      <Col md={7}>
        <h4>Available Lab Tests</h4>
        <hr />
        {listLoading ? (
          <Spinner />
        ) : (
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {allLabTests.map((test) => (
                  <tr key={test.id}>
                    <td>{test.id}</td>
                    <td>{test.name}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Col>
    </Row>
  );
};

// --- Tab for Viewing Reports (This component is correct) ---
const ReportsTab = () => {
  const socket = useSocket();
  const [visitReport, setVisitReport] = useState([]);
  const [medicineReport, setMedicineReport] = useState([]);
  const [labReport, setLabReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [visitRes, medRes, labRes] = await Promise.all([
        getDailyVisitReport(),
        getDailyMedicineReport(),
        getDailyLabTestReport(),
      ]);
      setVisitReport(visitRes.data);
      setMedicineReport(medRes.data);
      setLabReport(labRes.data);
    } catch (err) {
      setError("Failed to load one or more reports. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (!socket) return;
    // Listen to multiple events that could affect reports
    const handleUpdate = () => fetchReports();
    socket.on("reportsUpdate", handleUpdate);
    socket.on("doctorQueueUpdate", handleUpdate);
    socket.on("pharmacyQueueUpdate", handleUpdate);
    return () => {
      socket.off("reportsUpdate", handleUpdate);
      socket.off("doctorQueueUpdate", handleUpdate);
      socket.off("pharmacyQueueUpdate", handleUpdate);
    };
  }, [socket, fetchReports]);

  if (loading) return <Spinner />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Row>
      <Col md={4}>
        <Card>
          <Card.Header as="h5">Daily Patient Visits</Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patients</th>
                </tr>
              </thead>
              <tbody>
                {visitReport.map((report, index) => (
                  <tr key={`visit-${index}`}>
                    <td>{new Date(report.date).toLocaleDateString()}</td>
                    <td>{report.count}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card>
          <Card.Header as="h5">Daily Medicines Dispensed</Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Units</th>
                </tr>
              </thead>
              <tbody>
                {medicineReport.map((report, index) => (
                  <tr key={`med-${index}`}>
                    <td>{new Date(report.date).toLocaleDateString()}</td>
                    <td>{report.count}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card>
          <Card.Header as="h5">Daily Lab Tests Ordered</Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tests</th>
                </tr>
              </thead>
              <tbody>
                {labReport.map((report, index) => (
                  <tr key={`lab-${index}`}>
                    <td>{new Date(report.date).toLocaleDateString()}</td>
                    <td>{report.count}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

// --- Main Office Home Page Component ---
const OfficeHomePage = () => {
  return (
    <div>
      <h1 className="mb-4">Office Dashboard</h1>
      <Tab.Container defaultActiveKey="stock">
        <Card>
          <Card.Header>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="stock">Manage Medicines</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="lab_tests">Manage Lab Tests</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="reports">Hospital Reports</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="stock">
                <ManageStockTab />
              </Tab.Pane>
              <Tab.Pane eventKey="lab_tests">
                <ManageLabTestsTab />
              </Tab.Pane>
              <Tab.Pane eventKey="reports">
                <ReportsTab />
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
    </div>
  );
};

export default OfficeHomePage;
