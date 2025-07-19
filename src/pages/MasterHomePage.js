import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Modal, Form, Alert, Card } from "react-bootstrap";
import {
  getAllStaff,
  addStaff,
  updateStaff,
  deleteStaff,
} from "../api/apiService";
import ConfirmationModal from "../components/common/ConfirmationModal";
import Spinner from "../components/common/Spinner";
import { useSocket } from "../context/SocketContext";

const StaffEditorModal = ({ show, onHide, staff, onSave }) => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    // When adding, staff is null. Initialize all fields.
    setFormData(
      staff || {
        username: "",
        email: "",
        mobile: "",
        role: "Doctor",
        password: "",
      }
    );
    setError("");
  }, [staff]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // Updated validation
    if (!formData.username || !formData.role) {
      setError("Username and Role are required.");
      return;
    }
    if (!formData.id && !formData.password) {
      setError("Password is required for new staff.");
      return;
    }
    try {
      await onSave(formData);
      onHide();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to save staff.");
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {formData.id ? "Edit Staff" : "Add New Staff"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSave}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
            />
          </Form.Group>

          {/* CHANGE #1: ADDED MOBILE NUMBER FIELD */}
          <Form.Group className="mb-3">
            <Form.Label>Mobile Number</Form.Label>
            <Form.Control
              type="tel"
              name="mobile"
              value={formData.mobile || ""}
              onChange={handleChange}
            />
          </Form.Group>

          {!formData.id && (
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                onChange={handleChange}
                placeholder="Set initial password for new user"
                required
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select
              name="role"
              value={formData.role || "Doctor"}
              onChange={handleChange}
              required
            >
              <option value="Doctor">Doctor</option>
              <option value="OP">OP</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Lab">Lab</option>
              <option value="Office">Office</option>
            </Form.Select>
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const MasterHomePage = () => {
  const socket = useSocket();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEditor, setShowEditor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllStaff();
      setStaffList(res.data);
    } catch (err) {
      setError("Failed to fetch staff list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    if (!socket) return;
    socket.on("staffListUpdate", fetchStaff);
    return () => {
      socket.off("staffListUpdate", fetchStaff);
    };
  }, [socket, fetchStaff]);

  const handleAdd = () => {
    setSelectedStaff(null);
    setShowEditor(true);
  };

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setShowEditor(true);
  };

  const handleDelete = (staff) => {
    setSelectedStaff(staff);
    setShowDeleteConfirm(true);
  };

  const handleSaveStaff = async (staffData) => {
    if (staffData.id && staffData.password === "") {
      delete staffData.password;
    }

    if (staffData.id) {
      await updateStaff(staffData.id, staffData);
    } else {
      await addStaff(staffData);
    }
    fetchStaff();
  };

  const confirmDelete = async () => {
    try {
      await deleteStaff(selectedStaff.id);
      fetchStaff();
      setShowDeleteConfirm(false);
      setSelectedStaff(null);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete staff member.");
    }
  };

  if (loading) return <Spinner />;

  return (
    <Card>
      <Card.Header
        as="h5"
        className="d-flex justify-content-between align-items-center"
      >
        Staff Management
        <Button variant="primary" onClick={handleAdd}>
          Add New Staff
        </Button>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              {/* CHANGE #2: ADDED MOBILE NUMBER HEADER */}
              <th>Mobile</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => (
              <tr key={staff.id}>
                <td>{staff.id}</td>
                <td>{staff.username}</td>
                <td>{staff.email || "N/A"}</td>
                {/* CHANGE #3: ADDED MOBILE NUMBER DATA CELL */}
                <td>{staff.mobile || "N/A"}</td>
                <td>{staff.role}</td>
                <td>{new Date(staff.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEdit(staff)}
                  >
                    Edit
                  </Button>{" "}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(staff)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>

      <StaffEditorModal
        show={showEditor}
        onHide={() => setShowEditor(false)}
        staff={selectedStaff}
        onSave={handleSaveStaff}
      />

      <ConfirmationModal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        body={`Are you sure you want to delete the user "${selectedStaff?.username}"? This action cannot be undone.`}
      />
    </Card>
  );
};

export default MasterHomePage;
