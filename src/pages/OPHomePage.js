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
  InputGroup,
  Modal,
} from "react-bootstrap";
import {
  registerOP,
  createDoctorVisit,
  getPatientDetails,
  getPendingApprovals,
  approvePatient,
  getPendingPatientDetails,
} from "../api/apiService";
import Spinner from "../components/common/Spinner";
import { useSocket } from "../context/SocketContext";

// --- HELPER FUNCTION ---
const enforceNumeric = (value) => value.replace(/[^0-9]/g, "");

// --- SUB-COMPONENT: Approval Detail Modal ---
const ApprovalDetailModal = ({ show, onHide, patientAadhar }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (show && patientAadhar) {
      const fetchDetails = async () => {
        setLoading(true);
        setError("");
        try {
          const res = await getPendingPatientDetails(patientAadhar);
          setDetails(res.data);
        } catch (err) {
          setError("Failed to fetch patient details.");
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [show, patientAadhar]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Pending Registration Details</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {loading && <Spinner />}
        {error && <Alert variant="danger">{error}</Alert>}
        {details && (
          <>
            <h5>Primary Applicant: {details.primary.name}</h5>
            <Card className="mb-3">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p className="mb-1">
                      <strong>OP Number:</strong>{" "}
                      <span className="text-muted">Pending Assignment</span>
                    </p>
                    <p className="mb-1">
                      <strong>Phone:</strong> {details.primary.phone}
                    </p>
                    <p className="mb-1">
                      <strong>Aadhar:</strong> {details.primary.aadhar}
                    </p>
                    {/* <p className="mb-1">
                      <strong>Guardian:</strong> {details.primary.guardian}
                    </p> */}
                    <p className="mb-1">
                      <strong>Gender:</strong> {details.primary.gender}
                    </p>
                    <p className="mb-1">
                      <strong>DOB:</strong>{" "}
                      {details.primary.dob
                        ? new Date(details.primary.dob).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p className="mb-0">
                      <strong>Marital Status:</strong>{" "}
                      {details.primary.marital_status}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-1">
                      <strong>Designation:</strong>{" "}
                      {details.primary.designation}
                    </p>
                    <p className="mb-1">
                      <strong>ID Number:</strong> {details.primary.id_number}
                    </p>
                    <p className="mb-1">
                      <strong>Date of Joining:</strong>{" "}
                      {details.primary.date_of_joining
                        ? new Date(
                          details.primary.date_of_joining
                        ).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p className="mb-1">
                      <strong>Duration:</strong> {details.primary.duration}{" "}
                      years
                    </p>
                    <p className="mb-1">
                      <strong>Emergency Contact:</strong>{" "}
                      {details.primary.emergency_contact}
                    </p>
                    <p className="mb-1">
                      <strong>Physically Challenged:</strong>{" "}
                      {details.primary.physical_challenges}
                    </p>
                    <p className="mb-0">
                      <strong>Pre-existing Conditions:</strong>{" "}
                      {details.primary.pre_existing_conditions}
                    </p>
                  </Col>
                </Row>
                <hr />
                <p className="mb-1">
                  <strong>Address:</strong> {details.primary.address}
                </p>
              </Card.Body>
            </Card>
            {details.family && details.family.length > 0 && (
              <>
                <h5>Pending Family Members</h5>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Relation</th>
                      <th>Aadhar</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.family.map((member) => (
                      <tr key={member.id}>
                        <td>{member.name}</td>
                        <td>{member.designation.split(" of ")[1] || "N/A"}</td>
                        <td>{member.aadhar}</td>
                        <td>{member.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// --- SUB-COMPONENT: Approval Queue Tab ---
const ApprovalQueueTab = () => {
  const socket = useSocket();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPatientAadhar, setSelectedPatientAadhar] = useState(null);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await getPendingApprovals();
      setQueue(res.data);
    } catch (err) {
      setError("Failed to fetch pending approvals.");
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
    socket.on("pendingApprovalsUpdate", handleUpdate);
    return () => {
      socket.off("pendingApprovalsUpdate", handleUpdate);
    };
  }, [socket, fetchQueue]);

  const handleApprove = async (aadhar) => {
    setMessage("");
    setError("");
    try {
      const res = await approvePatient(aadhar);
      setMessage(res.data.msg);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to approve patient.");
    }
  };
  const handleViewDetails = (aadhar) => {
    setSelectedPatientAadhar(aadhar);
    setShowDetailModal(true);
  };

  if (loading) return <Spinner />;

  return (
    <>
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
      <p className="text-muted">
        Review and approve new patient registrations submitted through the
        public portal.
      </p>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Aadhar</th>
            <th>Designation</th>
            <th>Submitted On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {queue.length > 0 ? (
            queue.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.aadhar}</td>
                <td>{p.designation}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
                <td>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleViewDetails(p.aadhar)}
                    className="me-2"
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleApprove(p.aadhar)}
                  >
                    Approve
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No pending approvals.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <ApprovalDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        patientAadhar={selectedPatientAadhar}
      />
    </>
  );
};

// --- SUB-COMPONENT: Family Member Form ---
const FamilyMemberForm = ({ onAddMember }) => {
  const initialMemberState = {
    name: "",
    relation: "Spouse",
    dob: "",
    blood_group: "O+",
    aadhar: "",
    phone: "",
    email: "",
    gender: "Male",
    physical_challenges: "None",
    pre_existing_conditions: "None",
  };
  const [member, setMember] = useState(initialMemberState);
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["aadhar", "phone"].includes(name)) {
      setMember({ ...member, [name]: enforceNumeric(value) });
    } else {
      setMember({ ...member, [name]: value });
    }
  };
  const handleAddClick = () => {
    if (
      !member.name ||
      !member.relation ||
      !member.dob ||
      !member.blood_group ||
      !member.aadhar ||
      !member.phone ||
      !member.gender ||
      !member.physical_challenges ||
      !member.pre_existing_conditions ||
      !member.email
    ) {
      alert("All fields for a family member are mandatory.");
      return;
    }
    if (member.aadhar.length !== 12) {
      alert("Aadhar must be exactly 12 digits.");
      return;
    }
    if (member.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }
    onAddMember(member);
    setMember(initialMemberState);
  };
  const bloodGroups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  const relations = ["Spouse", "Son", "Daughter", "Father", "Mother"];
  const genders = ["Male", "Female", "Other"];
  return (
    <Card bg="light" className="p-3 mb-3">
      <Row className="mb-2 g-2">
        <Col md>
          <Form.Group>
            <Form.Label className="small mb-1">Name*</Form.Label>
            <Form.Control
              size="sm"
              type="text"
              name="name"
              value={member.name}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md>
          <Form.Group>
            <Form.Label className="small mb-1">Relation*</Form.Label>
            <Form.Select
              size="sm"
              name="relation"
              value={member.relation}
              onChange={handleChange}
            >
              {relations.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md>
          <Form.Group>
            <Form.Label className="small mb-1">Gender*</Form.Label>
            <Form.Select
              size="sm"
              name="gender"
              value={member.gender}
              onChange={handleChange}
            >
              {genders.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-2 g-2">
        <Col>
          <Form.Group>
            <Form.Label className="small mb-1">Date of Birth*</Form.Label>
            <Form.Control
              size="sm"
              type="date"
              name="dob"
              value={member.dob}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label className="small mb-1">Blood Group*</Form.Label>
            <Form.Select
              size="sm"
              name="blood_group"
              value={member.blood_group}
              onChange={handleChange}
            >
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label className="small mb-1">Aadhar (12 digits)*</Form.Label>
            <Form.Control
              size="sm"
              type="text"
              name="aadhar"
              value={member.aadhar}
              onChange={handleChange}
              maxLength="12"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="g-2">
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small mb-1">Phone (10 digits)*</Form.Label>
            <Form.Control
              size="sm"
              type="tel"
              name="phone"
              value={member.phone}
              onChange={handleChange}
              maxLength="10"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small mb-1">Email*</Form.Label>
            <Form.Control
              size="sm"
              type="email"
              name="email"
              value={member.email}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small mb-1">
              Physically Challenged*
            </Form.Label>
            <Form.Control
              size="sm"
              type="text"
              name="physical_challenges"
              value={member.physical_challenges}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="g-2 mt-2">
        <Col>
          <Form.Group>
            <Form.Label className="small mb-1">
              Pre-existing Conditions*
            </Form.Label>
            <Form.Control
              size="sm"
              type="text"
              name="pre_existing_conditions"
              value={member.pre_existing_conditions}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>
      <Button
        variant="info"
        size="sm"
        type="button"
        className="mt-2 align-self-end"
        onClick={handleAddClick}
      >
        Add Family Member to List
      </Button>
    </Card>
  );
};

// --- MAIN PAGE COMPONENT ---
const OPHomePage = () => {
  const [designationPrefix, setDesignationPrefix] = useState("TF");
  const [designationDetail, setDesignationDetail] = useState("");
  const initialUniState = {
    name: "",
    // guardian: "",
    phone: "",
    email: "",
    gender: "Male",
    marital_status: "Single",
    aadhar: "",
    dob: "",
    blood_group: "",
    designation: "TF",
    id_number: "",
    date_of_joining: "",
    duration: "",
    physical_challenges: "None",
    pre_existing_conditions: "None",
    emergency_contact: "",
    address: "",
  };
  const [uniFormData, setUniFormData] = useState(initialUniState);
  const [familyMembers, setFamilyMembers] = useState([]);
  const initialNonUniState = {
    name: "",
    // guardian: "",
    phone: "",
    email: "",
    gender: "Male",
    aadhar: "",
    blood_group: "",
    dob: "",
    reason_for_visit: "",
  };
  const [nonUniFormData, setNonUniFormData] = useState(initialNonUniState);
  const [visitFormData, setVisitFormData] = useState({
    op_number: "",
    reason_for_visit: "",
  });
  const [fetchedPatient, setFetchedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    const combinedDesignation = `${designationPrefix} - ${designationDetail}`;
    setUniFormData((prevState) => ({
      ...prevState,
      designation: combinedDesignation,
    }));
  }, [designationPrefix, designationDetail]);
  const handleUniChange = (e) => {
    const { name, value } = e.target;
    if (["phone", "emergency_contact", "aadhar", "duration"].includes(name)) {
      setUniFormData({ ...uniFormData, [name]: enforceNumeric(value) });
    } else {
      setUniFormData({ ...uniFormData, [name]: value });
    }
  };
  const handleNonUniChange = (e) => {
    const { name, value } = e.target;
    if (["phone", "aadhar"].includes(name)) {
      setNonUniFormData({ ...nonUniFormData, [name]: enforceNumeric(value) });
    } else {
      setNonUniFormData({ ...nonUniFormData, [name]: value });
    }
  };
  const handleVisitChange = (e) =>
    setVisitFormData({ ...visitFormData, [e.target.name]: e.target.value });
  const clearMessages = () => {
    setMessage("");
    setError("");
  };
  const handleAddFamilyMember = (member) =>
    setFamilyMembers([...familyMembers, member]);
  const handleRemoveFamilyMember = (index) =>
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  const handleRegistration = async (event, formData, type) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
    clearMessages();
    setLoading(true);
    try {
      const payload =
        type === "University"
          ? {
            ...formData,
            family_details: familyMembers,
            patient_type: "University Member",
            is_employee: true,
          }
          : {
            ...formData,
            patient_type: "Non-University Member",
            is_employee: false,
          };
      const res = await registerOP(payload);
      setMessage(
        `Patient registration successful! New OP Number: ${res.data.patient.op_number}.`
      );
      setUniFormData(initialUniState);
      setFamilyMembers([]);
      setNonUniFormData(initialNonUniState);
      setValidated(false);
      setDesignationPrefix("TF");
      setDesignationDetail("");
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchPatient = async () => {
    if (!visitFormData.op_number) return;
    clearMessages();
    setLoading(true);
    setFetchedPatient(null);
    try {
      const res = await getPatientDetails(visitFormData.op_number);
      setFetchedPatient(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch patient details.");
    } finally {
      setLoading(false);
    }
  };
  const handleVisitCreation = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await createDoctorVisit(visitFormData);
      setMessage(
        `Doctor visit for OP Number ${visitFormData.op_number} created successfully.`
      );
      setVisitFormData({ op_number: "", reason_for_visit: "" });
      setFetchedPatient(null);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to create visit.");
    } finally {
      setLoading(false);
    }
  };

  const bloodGroups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  const genders = ["Male", "Female", "Other"];
  const designationOptions = [
    { prefix: "TF", label: "Teaching" },
    { prefix: "NT", label: "Non-Teaching (Regular)" },
    { prefix: "TS", label: "Timescale" },
    { prefix: "NMR", label: "NMR (Hostel/NMR)" },
    { prefix: "AC", label: "Academic Consultant/Coordinator" },
    { prefix: "OS", label: "Out Sourcing" },
    { prefix: "CO", label: "Contract/Consolidated" },
    { prefix: "ST", label: "Students/Research Scholar (PhD)" },
  ];

  return (
    <div>
      <h1 className="mb-4">Out-Patient Desk</h1>
      {message && (
        <Alert variant="success" onClose={clearMessages} dismissible>
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" onClose={clearMessages} dismissible>
          {error}
        </Alert>
      )}
      <Tab.Container
        defaultActiveKey="approvals"
        onSelect={() => {
          clearMessages();
          setValidated(false);
        }}
      >
        <Card>
          <Card.Header>
            <Nav variant="pills">
              <Nav.Item>
                <Nav.Link eventKey="approvals">Pending Approvals</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="visit">Create Doctor Visit</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="university-reg">
                  New University Member
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="non-university-reg">
                  New Non-University Member
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="approvals">
                <ApprovalQueueTab />
              </Tab.Pane>
              <Tab.Pane eventKey="visit">
                <Form onSubmit={handleVisitCreation}>
                  <Row className="align-items-end">
                    <Col md={5}>
                      <Form.Group>
                        <Form.Label>OP Number</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="text"
                            name="op_number"
                            value={visitFormData.op_number}
                            onChange={handleVisitChange}
                            required
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={handleFetchPatient}
                            disabled={loading}
                          >
                            Fetch
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={7}>
                      {fetchedPatient && (
                        <Card bg="light" body className="p-2">
                          <strong>Name:</strong> {fetchedPatient.name},{" "}
                          <strong>Phone:</strong> {fetchedPatient.phone}
                        </Card>
                      )}
                    </Col>
                  </Row>
                  <Form.Group className="mt-3">
                    <Form.Label>Reason For Visit</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="reason_for_visit"
                      value={visitFormData.reason_for_visit}
                      onChange={handleVisitChange}
                      required
                      disabled={!fetchedPatient}
                    />
                  </Form.Group>
                  <Button
                    className="mt-3"
                    variant="primary"
                    type="submit"
                    disabled={loading || !fetchedPatient}
                  >
                    {loading ? "Creating..." : "Create Visit"}
                  </Button>
                </Form>
              </Tab.Pane>
              <Tab.Pane eventKey="university-reg">
                <Form
                  noValidate
                  validated={validated}
                  onSubmit={(e) =>
                    handleRegistration(e, uniFormData, "University")
                  }
                >
                  <h5>Personal Details</h5>
                  <Row className="mb-3">
                    <Form.Group as={Col} md="4">
                      <Form.Label>Name*</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={uniFormData.name}
                        onChange={handleUniChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group as={Col} md="4">
                      <Form.Label>Phone Number* (10 digits)</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={uniFormData.phone}
                        onChange={handleUniChange}
                        required
                        pattern="[0-9]{10}"
                        maxLength="10"
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid 10-digit number.
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="4">
                      <Form.Label>Email*</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={uniFormData.email}
                        onChange={handleUniChange}
                        required
                      />
                    </Form.Group>
                  </Row>
                  <Row className="mb-3">
                    <Form.Group as={Col}>
                      <Form.Label>Gender</Form.Label>
                      <Form.Select
                        name="gender"
                        value={uniFormData.gender}
                        onChange={handleUniChange}
                      >
                        {genders.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group as={Col}>
                      <Form.Label>Marital Status</Form.Label>
                      <Form.Select
                        name="marital_status"
                        value={uniFormData.marital_status}
                        onChange={handleUniChange}
                      >
                        <option>Single</option>
                        <option>Married</option>
                        <option>Divorced</option>
                        <option>Widowed</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group as={Col}>
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="dob"
                        value={uniFormData.dob}
                        onChange={handleUniChange}
                      />
                    </Form.Group>
                    <Form.Group as={Col}>
                      <Form.Label>Blood Group</Form.Label>
                      <Form.Select
                        name="blood_group"
                        value={uniFormData.blood_group}
                        onChange={handleUniChange}
                      >
                        <option value="">Select...</option>
                        {bloodGroups.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Row>
                  <Row className="mb-3">
                    <Form.Group as={Col}>
                      <Form.Label>Aadhar Number* (12 digits)</Form.Label>
                      <Form.Control
                        type="text"
                        name="aadhar"
                        value={uniFormData.aadhar}
                        onChange={handleUniChange}
                        required
                        pattern="[0-9]{12}"
                        maxLength="12"
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid 12-digit number.
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col}>
                      <Form.Label>
                        Emergency Contact No.* (10 digits)
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="emergency_contact"
                        value={uniFormData.emergency_contact}
                        onChange={handleUniChange}
                        required
                        pattern="[0-9]{10}"
                        maxLength="10"
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid 10-digit number.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <hr />
                  <h5>University Details</h5>
                  <Row className="mb-3">
                    <Col md={5}>
                      <Form.Group>
                        <Form.Label>Category*</Form.Label>
                        <Form.Select
                          value={designationPrefix}
                          onChange={(e) => setDesignationPrefix(e.target.value)}
                        >
                          {designationOptions.map((opt) => (
                            <option key={opt.prefix} value={opt.prefix}>
                              {opt.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={7}>
                      <Form.Group>
                        <Form.Label>Specific Designation*</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., Professor, B.Tech ECE..."
                          value={designationDetail}
                          onChange={(e) => setDesignationDetail(e.target.value)}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          Please provide the specific designation.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Form.Group as={Col}>
                      <Form.Label>ID Number*</Form.Label>
                      <Form.Control
                        type="text"
                        name="id_number"
                        value={uniFormData.id_number}
                        onChange={handleUniChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group as={Col}>
                      <Form.Label>Date of Joining*</Form.Label>
                      <Form.Control
                        type="date"
                        name="date_of_joining"
                        value={uniFormData.date_of_joining}
                        onChange={handleUniChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group as={Col}>
                      <Form.Label>Duration (in years)</Form.Label>
                      <Form.Control
                        type="text"
                        name="duration"
                        value={uniFormData.duration}
                        onChange={handleUniChange}
                        maxLength="2"
                      />
                    </Form.Group>
                  </Row>
                  <hr />
                  <h5>Health & Address</h5>
                  <Row className="mb-3">
                    <Form.Group as={Col}>
                      <Form.Label>Physically Challenged</Form.Label>
                      <Form.Control
                        type="text"
                        name="physical_challenges"
                        value={uniFormData.physical_challenges}
                        onChange={handleUniChange}
                      />
                    </Form.Group>
                    <Form.Group as={Col}>
                      <Form.Label>Pre-existing Health Conditions</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={1}
                        name="pre_existing_conditions"
                        value={uniFormData.pre_existing_conditions}
                        onChange={handleUniChange}
                      />
                    </Form.Group>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="address"
                      value={uniFormData.address}
                      onChange={handleUniChange}
                    />
                  </Form.Group>
                  <hr />
                  <h5>Family Details</h5>
                  <p className="text-muted small">
                    Add family members one by one. They will be registered when
                    you submit the main form.
                  </p>
                  <FamilyMemberForm onAddMember={handleAddFamilyMember} />
                  {familyMembers.length > 0 && (
                    <Table striped bordered size="sm">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Relation</th>
                          <th>Aadhar</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {familyMembers.map((m, i) => (
                          <tr key={i}>
                            <td>{m.name}</td>
                            <td>{m.relation}</td>
                            <td>{m.aadhar}</td>
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRemoveFamilyMember(i)}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="w-100 mt-3"
                  >
                    {loading
                      ? "Registering..."
                      : "Register University Member & Family"}
                  </Button>
                </Form>
              </Tab.Pane>
              <Tab.Pane eventKey="non-university-reg">
                <Form
                  noValidate
                  validated={validated}
                  onSubmit={(e) =>
                    handleRegistration(e, nonUniFormData, "Non-University")
                  }
                >
                  <h5>Non-University Patient Registration</h5>
                  <Row className="mb-3">
                    <Form.Group as={Col} md="4">
                      <Form.Label>Name*</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={nonUniFormData.name}
                        onChange={handleNonUniChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group as={Col} md="4">
                      <Form.Label>Phone Number* (10 digits)</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={nonUniFormData.phone}
                        onChange={handleNonUniChange}
                        required
                        pattern="[0-9]{10}"
                        maxLength="10"
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid 10-digit number.
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="4">
                      <Form.Label>Email*</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={nonUniFormData.email}
                        onChange={handleNonUniChange}
                        required
                      />
                    </Form.Group>
                  </Row>
                  <Row className="mb-3">
                    <Form.Group as={Col} md="6">
                      <Form.Label>Aadhar Number* (12 digits)</Form.Label>
                      <Form.Control
                        type="text"
                        name="aadhar"
                        value={nonUniFormData.aadhar}
                        onChange={handleNonUniChange}
                        required
                        pattern="[0-9]{12}"
                        maxLength="12"
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid 12-digit number.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Row className="mb-3">
                    <Form.Group as={Col} md="4">
                      <Form.Label>Gender*</Form.Label>
                      <Form.Select
                        name="gender"
                        value={nonUniFormData.gender}
                        onChange={handleNonUniChange}
                        required
                      >
                        {genders.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group as={Col} md="4">
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="dob"
                        value={nonUniFormData.dob}
                        onChange={handleNonUniChange}
                      />
                    </Form.Group>
                    <Form.Group as={Col} md="4">
                      <Form.Label>Blood Group</Form.Label>
                      <Form.Select
                        name="blood_group"
                        value={nonUniFormData.blood_group}
                        onChange={handleNonUniChange}
                      >
                        <option value="">Select...</option>
                        {bloodGroups.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Reason for Visit*</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="reason_for_visit"
                      value={nonUniFormData.reason_for_visit}
                      onChange={handleNonUniChange}
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register & Create Visit"}
                  </Button>
                </Form>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
    </div>
  );
};

export default OPHomePage;
