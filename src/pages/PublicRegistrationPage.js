import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  Col,
  Row,
  Alert,
  Container,
  Table,
} from "react-bootstrap";
import { publicRegisterOP } from "../api/apiService";

// Helper function to enforce numeric-only input
const enforceNumeric = (value) => value.replace(/[^0-9]/g, "");

// This is the same FamilyMemberForm from OPHomePage.js, it is correct.
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
        <Col md={4}>
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
        <Col md={4}>
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
        <Col md={4}>
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
        <Col md={4}>
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
        <Col md={4}>
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
        <Col md={4}>
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

const PublicRegistrationPage = () => {
  const [designationPrefix, setDesignationPrefix] = useState("TF");
  const [designationDetail, setDesignationDetail] = useState("");
  const initialUniState = {
    name: "",
    guardian: "",
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

  const handleAddFamilyMember = (member) =>
    setFamilyMembers([...familyMembers, member]);
  const handleRemoveFamilyMember = (index) =>
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));

  const handlePublicRegistration = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const payload = { ...uniFormData, family_details: familyMembers };
      const res = await publicRegisterOP(payload);
      setMessage(res.data.msg);
      setUniFormData(initialUniState);
      setFamilyMembers([]);
      setDesignationPrefix("TF");
      setDesignationDetail("");
      setValidated(false);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
        "Registration failed. Please check your details and try again."
      );
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
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card>
            <Card.Header as="h3" className="text-center bg-primary text-white">
              SVU Health Center - New Patient Pre-Registration
            </Card.Header>
            <Card.Body className="p-4">
              <p className="text-muted text-center">
                Please fill out this form to pre-register. Your details will be
                verified by our staff, and an OP Number will be assigned and
                communicated to you.
              </p>
              <hr />
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              {!message && (
                <Form
                  noValidate
                  validated={validated}
                  onSubmit={handlePublicRegistration}
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
                  </Row>
                  <Row className="mb-3">
                    {/* --- THIS IS THE FIX: Email field added --- */}
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
                    <Form.Group as={Col} md="4">
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
                    <Form.Group as={Col} md="4">
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
                  </Row>
                  <Row className="mb-3">
                    <Form.Group as={Col} md="4">
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="dob"
                        value={uniFormData.dob}
                        onChange={handleUniChange}
                      />
                    </Form.Group>
                    <Form.Group as={Col} md="4">
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
                    <Form.Group as={Col} md="4}">
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
                  </Row>
                  <Row className="mb-3">
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
                          placeholder="e.g., Professor, Lab Assistant..."
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
                  <h5>Family Details (if any)</h5>
                  <p className="text-muted small">
                    Add family members one by one. All fields are mandatory.
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
                    type="submit"
                    variant="primary"
                    className="w-100 mt-3"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit for Verification"}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PublicRegistrationPage;
