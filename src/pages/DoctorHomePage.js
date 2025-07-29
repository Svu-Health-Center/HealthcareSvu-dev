import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Card,
  Row,
  Col,
  ListGroup,
  Badge,
  Accordion,
} from "react-bootstrap";
import Select from "react-select";
import {
  getRegisteredOPs,
  getPatientHistory,
  completeConsultation,
  updateDiagnosis,
  addPostLabMedicines,
  getAllMedicines,
  getAllLabTests,
} from "../api/apiService";
import Spinner from "../components/common/Spinner";
import { useSocket } from "../context/SocketContext";

const ConsultationModal = ({ show, onHide, visit, onComplete }) => {
  const [patientHistory, setPatientHistory] = useState(null);
  const [allMedicines, setAllMedicines] = useState([]);
  const [allLabTests, setAllLabTests] = useState([]);
  const [diagnosis, setDiagnosis] = useState("");
  const [prescribedMedicines, setPrescribedMedicines] = useState([]);
  const [selectedLabTest, setSelectedLabTest] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [currentMedQty, setCurrentMedQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const medicineOptions = React.useMemo(
    () =>
      allMedicines.map((m) => ({
        value: m.id,
        label: `${m.name} (Stock: ${m.totalStock})`,
        stock: m.totalStock,
      })),
    [allMedicines]
  );
  const labTestOptions = React.useMemo(
    () => allLabTests.map((t) => ({ value: t.id, label: t.name })),
    [allLabTests]
  );

  useEffect(() => {
    if (visit) {
      setDiagnosis("");
      setPrescribedMedicines([]);
      setSelectedLabTest(null);
      setSelectedMedicine(null);
      setCurrentMedQty(1);
      setError("");
      const fetchData = async () => {
        try {
          setLoading(true);
          const [historyRes, medRes, testRes] = await Promise.all([
            getPatientHistory(visit.patient_id),
            getAllMedicines(),
            getAllLabTests(),
          ]);
          setPatientHistory(historyRes.data);
          setAllMedicines(medRes.data);
          setAllLabTests(testRes.data);
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Failed to load patient data.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [visit]);

  const handleAddMedicineToList = () => {
    if (!selectedMedicine || currentMedQty <= 0) {
      alert("Please select a medicine and enter a valid quantity.");
      return;
    }
    if (prescribedMedicines.some((med) => med.id === selectedMedicine.value)) {
      alert("This medicine is already in the prescription.");
      return;
    }
    if (parseInt(currentMedQty) > selectedMedicine.stock) {
      alert(
        `Cannot prescribe ${currentMedQty} units. Only ${selectedMedicine.stock} are available.`
      );
      return;
    }
    setPrescribedMedicines([
      ...prescribedMedicines,
      {
        id: selectedMedicine.value,
        name: selectedMedicine.label.split(" (")[0],
        quantity: parseInt(currentMedQty, 10),
      },
    ]);
    setSelectedMedicine(null);
    setCurrentMedQty(1);
  };

  const handleRemoveMedicine = (medIdToRemove) =>
    setPrescribedMedicines(
      prescribedMedicines.filter((med) => med.id !== medIdToRemove)
    );
  const handleOrderLabTest = (selection) => setSelectedLabTest(selection);

  const handleComplete = async () => {
    if (!diagnosis) {
      setError("Diagnosis notes cannot be empty.");
      return;
    }
    try {
      const payload = {
        diagnosis,
        prescribedMedicines: prescribedMedicines.map(({ id, quantity }) => ({
          id,
          quantity,
        })),
        orderedLabTests: selectedLabTest ? [{ id: selectedLabTest.value }] : [],
      };
      await completeConsultation(visit.id, payload);
      onComplete();
      onHide();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to complete consultation.");
    }
  };

  if (!visit) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          Consultation for: {patientHistory?.name} (OP:{" "}
          {patientHistory?.op_number})
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <Spinner />
        ) : (
          <Row>
            <Col md={5} style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <Card className="mb-3">
                <Card.Header as="h6">Patient Details</Card.Header>
                <Card.Body className="p-2">
                  <Row>
                    <Col xs={6}>
                      <strong>Gender:</strong> {patientHistory?.gender}
                    </Col>
                    <Col xs={6}>
                      <strong>DOB:</strong>{" "}
                      {patientHistory?.dob
                        ? new Date(patientHistory.dob).toLocaleDateString()
                        : "N/A"}
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={6}>
                      <strong>Phone:</strong> {patientHistory?.phone}
                    </Col>
                    <Col xs={6}>
                      <strong>Blood Group:</strong>{" "}
                      {patientHistory?.blood_group}
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <strong>Designation:</strong>{" "}
                      {patientHistory?.designation}
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <strong>Pre-existing Conditions:</strong>{" "}
                      {patientHistory?.pre_existing_conditions}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              <h6>Visit History</h6>
              <Accordion flush>
                {patientHistory?.Visits?.length > 0 ? (
                  patientHistory.Visits.map((v, index) => (
                    <Accordion.Item eventKey={index.toString()} key={v.id}>
                      <Accordion.Header>
                        <strong>
                          {new Date(v.registered_at).toLocaleDateString()}
                        </strong>
                        <span className="ms-2 text-muted">
                          {v.reason_for_visit
                            .split("\n\nDiagnosis:")[0]
                            .substring(0, 30)}
                          ...
                        </span>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="d-flex justify-content-between text-muted small mb-2">
                          <span>
                            <strong>Doctor:</strong>{" "}
                            {v.doctor?.username || "N/A"}
                          </span>
                          <span>
                            <strong>OP Desk:</strong>{" "}
                            {v.creator?.username || "N/A"}
                          </span>
                        </div>
                        <hr className="my-1" />
                        <strong>Full Complaint & Diagnosis:</strong>
                        <p style={{ whiteSpace: "pre-wrap" }}>
                          {v.reason_for_visit}
                        </p>
                        <strong>Prescribed Medicines:</strong>
                        {v.Medicines.length > 0 ? (
                          <ListGroup variant="flush" className="mb-2">
                            {v.Medicines.map((med) => (
                              <ListGroup.Item key={med.id}>
                                <div className="d-flex justify-content-between">
                                  <span>
                                    {med.name} (Qty:{" "}
                                    {med.prescribed_medicines?.quantity})
                                  </span>
                                  <Badge
                                    bg={
                                      med.prescribed_medicines?.dispensed
                                        ? "success"
                                        : "secondary"
                                    }
                                  >
                                    {med.prescribed_medicines?.dispensed
                                      ? `Dispensed by ${med.prescribed_medicines?.dispenser?.username}`
                                      : "Prescribed"}
                                  </Badge>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        ) : (
                          <p className="text-muted">None</p>
                        )}
                        <strong>Ordered Lab Tests:</strong>
                        {v.LabTests.length > 0 ? (
                          <ListGroup variant="flush">
                            {v.LabTests.map((test) => (
                              <ListGroup.Item key={test.id}>
                                {test.name} -{" "}
                                {test.ordered_lab_tests.report_url ? (
                                  <a
                                    href={test.ordered_lab_tests.report_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View Report
                                  </a>
                                ) : (
                                  "Report Pending"
                                )}
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        ) : (
                          <p className="text-muted">None</p>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))
                ) : (
                  <p className="text-muted">No previous visit history found.</p>
                )}
              </Accordion>
            </Col>
            <Col md={7}>
              <h5>
                Current Visit: {new Date(visit.registered_at).toLocaleString()}
              </h5>
              <p>
                <strong>Reason:</strong> {visit.reason_for_visit}
              </p>
              <hr />
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Diagnosis & Notes*</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </Form.Group>
                <Card className="p-3 mb-3">
                  <Row className="align-items-end">
                    <Col xs={7}>
                      <Form.Group>
                        <Form.Label>Medicine</Form.Label>
                        <Select
                          options={medicineOptions}
                          value={selectedMedicine}
                          onChange={setSelectedMedicine}
                          placeholder="Search for a medicine..."
                          isClearable
                          isSearchable
                          getOptionValue={(o) => o.value}
                          getOptionLabel={(o) => o.label}
                          isOptionDisabled={(o) => o.stock <= 0}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={3}>
                      <Form.Group>
                        <Form.Label>Quantity</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          value={currentMedQty}
                          onChange={(e) => setCurrentMedQty(e.target.value)}
                          disabled={!selectedMedicine}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={2} className="d-grid">
                      <Button
                        variant="success"
                        onClick={handleAddMedicineToList}
                        disabled={!selectedMedicine || currentMedQty < 1}
                      >
                        Add
                      </Button>
                    </Col>
                  </Row>
                </Card>
                <h6>Current Prescription</h6>
                <ListGroup className="mb-3">
                  {prescribedMedicines.length > 0 ? (
                    prescribedMedicines.map((pm) => (
                      <ListGroup.Item
                        key={pm.id}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <span>
                          <strong>{pm.name}</strong> (Qty: {pm.quantity})
                        </span>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveMedicine(pm.id)}
                        >
                          Remove
                        </Button>
                      </ListGroup.Item>
                    ))
                  ) : (
                    <p className="text-muted">No medicines prescribed yet.</p>
                  )}
                </ListGroup>
                <Form.Group>
                  <Form.Label>Order Lab Test (Max: 1)</Form.Label>
                  <Select
                    options={labTestOptions}
                    value={selectedLabTest}
                    onChange={handleOrderLabTest}
                    placeholder="Search for a lab test..."
                    isClearable
                    isSearchable
                  />
                </Form.Group>
              </Form>
            </Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleComplete}>
          Complete Consultation
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const EditConsultationModal = ({ show, onHide, visit, onComplete }) => {
  const [patientHistory, setPatientHistory] = useState(null);
  const [allMedicines, setAllMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [additionalMedicines, setAdditionalMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [currentMedQty, setCurrentMedQty] = useState(1);
  const medicineOptions = React.useMemo(
    () =>
      allMedicines.map((m) => ({
        value: m.id,
        label: `${m.name} (Stock: ${m.totalStock})`,
        stock: m.totalStock,
      })),
    [allMedicines]
  );
  const previouslyPrescribedMeds = React.useMemo(() => {
    if (!patientHistory || !visit) return [];
    return (
      patientHistory.Visits.find((v) => v.id === visit.id)?.Medicines || []
    );
  }, [patientHistory, visit]);

  useEffect(() => {
    if (visit) {
      setLoading(true);
      setError("");
      setAdditionalMedicines([]);
      setSelectedMedicine(null);
      setCurrentMedQty(1);
      const fetchData = async () => {
        try {
          const [historyRes, medRes] = await Promise.all([
            getPatientHistory(visit.patient_id),
            getAllMedicines(),
          ]);
          setPatientHistory(historyRes.data);
          setAllMedicines(medRes.data);
          const currentVisitData = historyRes.data.Visits.find(
            (v) => v.id === visit.id
          );
          const reasonParts =
            currentVisitData?.reason_for_visit.split("\n\nDiagnosis: ");
          setDiagnosis(reasonParts?.[1] || "");
        } catch (err) {
          setError("Failed to load patient history.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [visit]);

  const handleAddMedicineToList = () => {
    if (!selectedMedicine || currentMedQty <= 0) {
      alert("Please select a medicine and enter a valid quantity.");
      return;
    }
    if (
      previouslyPrescribedMeds.some(
        (med) => med.id === selectedMedicine.value
      ) ||
      additionalMedicines.some((med) => med.id === selectedMedicine.value)
    ) {
      alert("This medicine is already in the prescription.");
      return;
    }
    if (parseInt(currentMedQty) > selectedMedicine.stock) {
      alert(
        `Cannot prescribe ${currentMedQty} units. Only ${selectedMedicine.stock} are available.`
      );
      return;
    }
    setAdditionalMedicines([
      ...additionalMedicines,
      {
        id: selectedMedicine.value,
        name: selectedMedicine.label.split(" (")[0],
        quantity: parseInt(currentMedQty, 10),
      },
    ]);
    setSelectedMedicine(null);
    setCurrentMedQty(1);
  };

  const handleRemoveMedicine = (medIdToRemove) =>
    setAdditionalMedicines(
      additionalMedicines.filter((med) => med.id !== medIdToRemove)
    );

  const handleSaveChanges = async () => {
    if (!diagnosis) {
      setError("Diagnosis cannot be empty.");
      return;
    }
    try {
      const currentVisitData = patientHistory.Visits.find(
        (v) => v.id === visit.id
      );
      if (!currentVisitData) {
        setError("Could not find visit details. Please refresh.");
        return;
      }
      const originalReason =
        currentVisitData.reason_for_visit.split("\n\nDiagnosis: ")[0];
      const fullDiagnosisString =
        originalReason + "\n\nDiagnosis: " + diagnosis;
      await updateDiagnosis(visit.id, { diagnosis: fullDiagnosisString });
      await addPostLabMedicines(visit.id, {
        prescribedMedicines: additionalMedicines,
      });
      onComplete();
      onHide();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to save changes.");
    }
  };

  if (!visit) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          Post-Lab Consultation for {patientHistory?.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}
        {loading ? (
          <Spinner />
        ) : (
          <Row>
            <Col md={5} style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <Card className="mb-3">
                <Card.Header as="h6">Patient Details</Card.Header>
                <Card.Body className="p-2">
                  <Row>
                    <Col xs={6}>
                      <strong>Gender:</strong> {patientHistory?.gender}
                    </Col>
                    <Col xs={6}>
                      <strong>DOB:</strong>{" "}
                      {patientHistory?.dob
                        ? new Date(patientHistory.dob).toLocaleDateString()
                        : "N/A"}
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={6}>
                      <strong>Phone:</strong> {patientHistory?.phone}
                    </Col>
                    <Col xs={6}>
                      <strong>Blood Group:</strong>{" "}
                      {patientHistory?.blood_group}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              <h6>Complete Patient History</h6>
              <Accordion flush>
                {patientHistory?.Visits?.length > 0 ? (
                  patientHistory.Visits.map((v, index) => (
                    <Accordion.Item eventKey={index.toString()} key={v.id}>
                      <Accordion.Header>
                        <strong>
                          {new Date(v.registered_at).toLocaleDateString()}
                        </strong>
                        <span className="ms-2 text-muted">
                          {v.reason_for_visit
                            .split("\n\nDiagnosis:")[0]
                            .substring(0, 30)}
                          ...
                        </span>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="d-flex justify-content-between text-muted small mb-2">
                          <span>
                            <strong>Doctor:</strong>{" "}
                            {v.doctor?.username || "N/A"}
                          </span>
                          <span>
                            <strong>OP Desk:</strong>{" "}
                            {v.creator?.username || "N/A"}
                          </span>
                        </div>
                        <hr className="my-1" />
                        <strong>Full Complaint & Diagnosis:</strong>
                        <p style={{ whiteSpace: "pre-wrap" }}>
                          {v.reason_for_visit}
                        </p>
                        <strong>Prescribed Medicines:</strong>
                        {v.Medicines.length > 0 ? (
                          <ListGroup variant="flush" className="mb-2">
                            {v.Medicines.map((med) => (
                              <ListGroup.Item key={med.id}>
                                <div className="d-flex justify-content-between">
                                  <span>
                                    {med.name} (Qty:{" "}
                                    {med.prescribed_medicines?.quantity})
                                  </span>
                                  <Badge
                                    bg={
                                      med.prescribed_medicines?.dispensed
                                        ? "success"
                                        : "secondary"
                                    }
                                  >
                                    {med.prescribed_medicines?.dispensed
                                      ? `Dispensed by ${med.prescribed_medicines?.dispenser?.username}`
                                      : "Prescribed"}
                                  </Badge>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        ) : (
                          <p className="text-muted">None</p>
                        )}
                        <strong>Ordered Lab Tests:</strong>
                        {v.LabTests.length > 0 ? (
                          <ListGroup variant="flush">
                            {v.LabTests.map((test) => (
                              <ListGroup.Item key={test.id}>
                                {test.name} -{" "}
                                {test.ordered_lab_tests.report_url ? (
                                  <a
                                    href={test.ordered_lab_tests.report_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View Report
                                  </a>
                                ) : (
                                  "Report Pending"
                                )}
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        ) : (
                          <p className="text-muted">None</p>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))
                ) : (
                  <p className="text-muted">No previous visit history found.</p>
                )}
              </Accordion>
            </Col>
            <Col md={7}>
              <h5>Review & Update for Current Visit</h5>
              <ListGroup className="mb-3">
                {patientHistory?.Visits.find(
                  (v) => v.id === visit.id
                )?.LabTests.map((test) => (
                  <ListGroup.Item
                    key={test.id}
                    as="a"
                    href={test.ordered_lab_tests.report_url}
                    target="_blank"
                  >
                    {test.name} - <Badge bg="success">View Report</Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Form.Group>
                <Form.Label>Update Diagnosis & Notes*</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </Form.Group>
              <hr />
              <h5>Prescribe Additional Medicines</h5>
              <strong className="d-block mb-2">
                Already Prescribed for this Visit:
              </strong>
              <ListGroup variant="flush" className="mb-3">
                {previouslyPrescribedMeds.length > 0 ? (
                  previouslyPrescribedMeds.map((med) => (
                    <ListGroup.Item key={med.id} className="text-muted ps-0">
                      {med.name} (Qty: {med.prescribed_medicines?.quantity}) -{" "}
                      <Badge
                        bg={
                          med.prescribed_medicines?.dispensed
                            ? "success"
                            : "warning"
                        }
                        pill
                      >
                        {med.prescribed_medicines?.dispensed
                          ? "Dispensed"
                          : "Pending"}
                      </Badge>
                    </ListGroup.Item>
                  ))
                ) : (
                  <p className="text-muted">None.</p>
                )}
              </ListGroup>
              <Card className="p-3 mb-3">
                <Row className="align-items-end">
                  <Col xs={7}>
                    <Form.Group>
                      <Form.Label>Add New Medicine</Form.Label>
                      <Select
                        options={medicineOptions}
                        value={selectedMedicine}
                        onChange={setSelectedMedicine}
                        placeholder="Search..."
                        isClearable
                        isSearchable
                        getOptionValue={(o) => o.value}
                        getOptionLabel={(o) => o.label}
                        isOptionDisabled={(o) => o.totalStock <= 0}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={3}>
                    <Form.Group>
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={currentMedQty}
                        onChange={(e) => setCurrentMedQty(e.target.value)}
                        disabled={!selectedMedicine}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={2} className="d-grid">
                    <Button
                      variant="success"
                      onClick={handleAddMedicineToList}
                      disabled={!selectedMedicine || currentMedQty < 1}
                    >
                      Add
                    </Button>
                  </Col>
                </Row>
              </Card>
              <h6>Newly Added Prescription</h6>
              <ListGroup className="mb-3">
                {additionalMedicines.length > 0 ? (
                  additionalMedicines.map((pm) => {
                    const medicineDetails = allMedicines.find(
                      (m) => parseInt(m.id) === parseInt(pm.id)
                    );
                    return (
                      <ListGroup.Item
                        key={pm.id}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <strong>{medicineDetails?.name}</strong>
                        </div>
                        <div>Quantity: {pm.quantity}</div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveMedicine(pm.id)}
                        >
                          Remove
                        </Button>
                      </ListGroup.Item>
                    );
                  })
                ) : (
                  <p className="text-muted">No new medicines added yet.</p>
                )}
              </ListGroup>
            </Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveChanges}>
          Save Changes & Send to Pharmacy
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const DoctorHomePage = () => {
  const socket = useSocket();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const fetchQueue = useCallback(async () => {
    try {
      const res = await getRegisteredOPs();
      setQueue(res.data);
    } catch (err) {
      setError("Failed to fetch patient queue.");
      console.error(err);
    }
  }, []);
  useEffect(() => {
    setLoading(true);
    fetchQueue().finally(() => setLoading(false));
  }, [fetchQueue]);
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      fetchQueue();
    };
    socket.on("doctorQueueUpdate", handleUpdate);
    return () => {
      socket.off("doctorQueueUpdate", handleUpdate);
    };
  }, [socket, fetchQueue]);
  const handleOpenConsultModal = (visit) => {
    setSelectedVisit(visit);
    setShowConsultModal(true);
  };
  const handleOpenEditModal = (visit) => {
    setSelectedVisit(visit);
    setShowEditModal(true);
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "PATIENT_REGISTERED":
        return <Badge bg="primary">New Patient</Badge>;
      case "LAB_REPORTS_SUBMITTED":
        return <Badge bg="success">Lab Reports Ready</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  if (loading) return <Spinner />;
  return (
    <Card>
      {" "}
      <Card.Header as="h5">Doctor's Dashboard - Patient Queue</Card.Header>{" "}
      <Card.Body>
        {" "}
        {error && <Alert variant="danger">{error}</Alert>}{" "}
        <Table striped bordered hover responsive>
          {" "}
          <thead>
            <tr>
              <th>OP Number</th>
              <th>Name</th>
              <th>Status</th>
              <th>Registered At</th>
              <th>Actions</th>
            </tr>
          </thead>{" "}
          <tbody>
            {" "}
            {queue.length > 0 ? (
              queue.map((visit) => (
                <tr key={visit.id}>
                  {" "}
                  <td>{visit.Patient.op_number}</td>{" "}
                  <td>{visit.Patient.name}</td>{" "}
                  <td>{getStatusBadge(visit.status)}</td>{" "}
                  <td>{new Date(visit.registered_at).toLocaleString()}</td>{" "}
                  <td>
                    {" "}
                    {visit.status === "PATIENT_REGISTERED" ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenConsultModal(visit)}
                      >
                        Consult
                      </Button>
                    ) : (
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleOpenEditModal(visit)}
                      >
                        Review Reports
                      </Button>
                    )}{" "}
                  </td>{" "}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No patients in the queue.
                </td>
              </tr>
            )}{" "}
          </tbody>{" "}
        </Table>{" "}
      </Card.Body>{" "}
      {selectedVisit && (
        <>
          {" "}
          <ConsultationModal
            show={showConsultModal}
            onHide={() => setShowConsultModal(false)}
            visit={selectedVisit}
            onComplete={fetchQueue}
          />{" "}
          <EditConsultationModal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            visit={selectedVisit}
            onComplete={fetchQueue}
          />{" "}
        </>
      )}{" "}
    </Card>
  );
};

export default DoctorHomePage;
