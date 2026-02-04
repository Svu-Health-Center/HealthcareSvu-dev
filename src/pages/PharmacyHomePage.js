import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Alert,
  Card,
  ListGroup,
  Tab,
  Nav,
  Form,
  Badge,
} from "react-bootstrap";
import {
  getPharmacyQueue,
  issueMedicines,
  getAllMedicines,
} from "../api/apiService";
import Spinner from "../components/common/Spinner";
import { useSocket } from "../context/SocketContext";

const PrescriptionModal = ({ show, onHide, visit, onIssue }) => {
  if (!visit) return null;
  const isStockInsufficient = visit.Medicines.some(
    (med) =>
      !med.prescribed_medicines.dispensed &&
      med.prescribed_medicines.quantity > med.stock
  );
  const hasPendingMedicines = visit.Medicines.some(
    (med) => !med.prescribed_medicines.dispensed
  );
  return (
    <Modal show={show} onHide={onHide}>
      {" "}
      <Modal.Header closeButton>
        <Modal.Title>Prescription for {visit.Patient.name}</Modal.Title>
      </Modal.Header>{" "}
      <Modal.Body>
        {" "}
        {isStockInsufficient && (
          <Alert variant="danger">
            Warning: Insufficient stock for one or more pending medicines.
          </Alert>
        )}{" "}
        <h6>Prescribed Medicines:</h6>{" "}
        <ListGroup>
          {visit.Medicines.map((med) => (
            <ListGroup.Item
              key={med.id}
              className="d-flex justify-content-between align-items-center"
              variant={
                !med.prescribed_medicines.dispensed &&
                  med.prescribed_medicines.quantity > med.stock
                  ? "danger"
                  : ""
              }
            >
              <div>
                <strong>{med.name}</strong>
                <br />
                {!med.prescribed_medicines.dispensed && (
                  <small className="text-muted">
                    Required: {med.prescribed_medicines.quantity} | Available:{" "}
                    {med.stock}
                  </small>
                )}
              </div>
              <Badge
                bg={med.prescribed_medicines.dispensed ? "success" : "warning"}
              >
                {med.prescribed_medicines.dispensed ? "Dispensed" : "Pending"}
              </Badge>
            </ListGroup.Item>
          ))}
        </ListGroup>{" "}
      </Modal.Body>{" "}
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button
          variant="success"
          onClick={() => onIssue(visit.id)}
          disabled={isStockInsufficient || !hasPendingMedicines}
        >
          Dispense Pending Medicines
        </Button>
      </Modal.Footer>{" "}
    </Modal>
  );
};

const DispensingQueueTab = () => {
  const socket = useSocket();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const fetchQueue = useCallback(async () => {
    try {
      const res = await getPharmacyQueue();
      setQueue(res.data);
    } catch (err) {
      setError("Failed to fetch pharmacy queue.");
      console.error(err);
    }
  }, []);
  useEffect(() => {
    setLoading(true);
    fetchQueue().finally(() => setLoading(false));
  }, [fetchQueue]);
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchQueue();
    socket.on("pharmacyQueueUpdate", handleUpdate);
    return () => {
      socket.off("pharmacyQueueUpdate", handleUpdate);
    };
  }, [socket, fetchQueue]);
  const handleView = (visit) => {
    setSelectedVisit(visit);
    setShowModal(true);
  };
  const handleIssue = async (visitId) => {
    try {
      await issueMedicines(visitId);
      setShowModal(false);
      fetchQueue();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to dispense medicines.");
    }
  };
  if (loading) return <Spinner />;
  return (
    <>
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>OP Number</th>
            <th>Name</th>
            <th>Consultation Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {queue.length > 0 ? (
            queue.map((v, i) => (
              <tr key={v.id}>
                <td>{i + 1}</td>
                <td>{v.Patient.op_number}</td>
                <td>{v.Patient.name}</td>
                <td>
                  {new Date(v.consultation_completed_at).toLocaleString()}
                </td>
                <td>
                  <Button size="sm" onClick={() => handleView(v)}>
                    View Prescription
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No patients in the queue for dispensing.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <PrescriptionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        visit={selectedVisit}
        onIssue={handleIssue}
      />
    </>
  );
};

const InventoryTab = () => {
  const socket = useSocket();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const fetchInventory = useCallback(async () => {
    try {
      const res = await getAllMedicines();
      setMedicines(res.data);
    } catch (err) {
      console.error("Failed to fetch medicine inventory:", err);
    }
  }, []);
  useEffect(() => {
    setLoading(true);
    fetchInventory().finally(() => setLoading(false));
  }, [fetchInventory]);
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchInventory();
    socket.on("inventoryUpdate", handleUpdate);
    return () => {
      socket.off("inventoryUpdate", handleUpdate);
    };
  }, [socket, fetchInventory]);
  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (loading) return <Spinner />;
  return (
    <>
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search for a medicine..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>
      <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
        <Table striped bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Medicine Name</th>
              <th>Total Available Stock</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedicines.map((med) => (
              <tr
                key={med.id}
                className={
                  med.totalStock <= 10
                    ? "table-danger"
                    : med.totalStock <= 50
                      ? "table-warning"
                      : ""
                }
              >
                <td>{med.id}</td>
                <td>{med.name}</td>
                <td>{med.totalStock}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
};

const PharmacyHomePage = () => {
  return (
    <Card>
      <Card.Header as="h5">Pharmacy Dashboard</Card.Header>
      <Card.Body>
        <Tab.Container defaultActiveKey="dispensing">
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="dispensing">Dispensing Queue</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="inventory">Medicine Inventory</Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="dispensing">
              <DispensingQueueTab />
            </Tab.Pane>
            <Tab.Pane eventKey="inventory">
              <InventoryTab />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  );
};

export default PharmacyHomePage;
