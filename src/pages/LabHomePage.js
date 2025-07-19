import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Modal, Form, Alert, Card } from "react-bootstrap";
import { getLabQueue, uploadLabReport } from "../api/apiService";
import Spinner from "../components/common/Spinner";
import { useSocket } from "../context/SocketContext";

// This modal component is correct and does not need changes.
const UploadReportModal = ({ show, onHide, test, onUpload }) => {
  const [reportUrl, setReportUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setReportUrl(test?.ordered_lab_tests?.report_url || "");
    setError("");
  }, [test]);

  if (!test) return null;

  const handleUpload = async () => {
    if (!reportUrl) {
      setError("Report URL cannot be empty.");
      return;
    }
    try {
      const orderedTestId = test.ordered_lab_tests.id;
      if (!orderedTestId) {
        setError("Could not find the specific test order ID. Please refresh.");
        return;
      }
      await onUpload(orderedTestId, reportUrl);
      onHide();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to upload report.");
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Upload Report for: {test.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group>
          <Form.Label>Report URL</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g., https://reports.example.com/report123.pdf"
            value={reportUrl}
            onChange={(e) => setReportUrl(e.target.value)}
          />
          <Form.Text className="text-muted">
            In a real application, this would be a file upload field.
          </Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleUpload}>
          Save Report
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// --- THIS IS THE MAIN COMPONENT WITH THE FIXES ---
const LabHomePage = () => {
  const socket = useSocket();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  // 1. Define fetchQueue with useCallback and an EMPTY dependency array [].
  const fetchQueue = useCallback(async () => {
    try {
      setError("");
      const res = await getLabQueue();
      const flattenedQueue = res.data.flatMap((visit) =>
        visit.LabTests.map((test) => ({
          ...test,
          visitId: visit.id,
          patientName: visit.Patient.name,
          opNumber: visit.Patient.op_number,
          consultationTime: visit.consultation_completed_at,
        }))
      );
      setQueue(flattenedQueue);
    } catch (err) {
      setError("Failed to fetch lab test queue.");
      console.error(err);
    } finally {
      // This will only matter on the initial load, not subsequent refreshes
      setLoading(false);
    }
  }, []);

  // 2. Use one useEffect for the initial data fetch.
  useEffect(() => {
    setLoading(true);
    fetchQueue().finally(() => setLoading(false));
  }, [fetchQueue]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchQueue();
    socket.on("labQueueUpdate", handleUpdate);
    return () => {
      socket.off("labQueueUpdate", handleUpdate);
    };
  }, [socket, fetchQueue]);

  const handleOpenModal = (test) => {
    setSelectedTest(test);
    setShowModal(true);
  };

  const handleUpload = async (orderedLabTestId, reportUrl) => {
    await uploadLabReport(orderedLabTestId, reportUrl);
    fetchQueue(); // Manually refresh after our own action
  };

  if (loading) return <Spinner />;

  return (
    <>
      <Card>
        <Card.Header as="h5">Lab Investigation Queue</Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>OP Number</th>
                <th>Patient Name</th>
                <th>Test Name</th>
                <th>Ordered At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.length > 0 ? (
                queue.map((test) => (
                  <tr key={test.ordered_lab_tests.id}>
                    <td>{test.opNumber}</td>
                    <td>{test.patientName}</td>
                    <td>{test.name}</td>
                    <td>{new Date(test.consultationTime).toLocaleString()}</td>
                    <td>
                      <Button size="sm" onClick={() => handleOpenModal(test)}>
                        Upload Report
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No lab tests in the queue.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <UploadReportModal
        show={showModal}
        onHide={() => setShowModal(false)}
        test={selectedTest}
        onUpload={handleUpload}
      />
    </>
  );
};

export default LabHomePage;
