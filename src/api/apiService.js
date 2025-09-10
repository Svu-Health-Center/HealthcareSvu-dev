import api from "./api";

// --- PUBLIC API ---
export const publicRegisterOP = (patientData) =>
  api.post("/public/register", patientData);

// --- Master API ---
export const getAllStaff = () => api.get("/master/staff");
export const addStaff = (staffData) => api.post("/master/staff", staffData);
export const updateStaff = (id, staffData) =>
  api.put(`/master/staff/${id}`, staffData);
export const deleteStaff = (id) => api.delete(`/master/staff/${id}`);

// --- OP API ---
export const getPatientDetails = (opNumber) =>
  api.get(`/op/patient-details/${opNumber}`);
export const registerOP = (patientData) =>
  api.post("/op/register", patientData);
export const createDoctorVisit = (visitData) =>
  api.post("/op/create-visit", visitData);
export const getPendingApprovals = () => api.get("/op/pending-approvals");
export const approvePatient = (aadhar) =>
  api.post(`/op/approve-patient/${aadhar}`);
export const getPendingPatientDetails = (aadhar) =>
  api.get(`/op/pending-patient/${aadhar}`);

// --- Doctor API ---
export const getRegisteredOPs = () => api.get("/doctor/registered-ops");
export const getPatientHistory = (patientId) =>
  api.get(`/doctor/patient-history/${patientId}`);
export const completeConsultation = (visitId, consultationData) =>
  api.post(`/doctor/complete-consultation/${visitId}`, consultationData);
export const updateDiagnosis = (visitId, diagnosisData) =>
  api.put(`/doctor/update-diagnosis/${visitId}`, diagnosisData);
export const addPostLabMedicines = (visitId, medicineData) =>
  api.post(`/doctor/add-medicines/${visitId}`, medicineData);

// --- Pharmacy API ---
export const getPharmacyQueue = () => api.get("/pharmacy/queue");
export const issueMedicines = (visitId) =>
  api.post(`/pharmacy/issue-medicines/${visitId}`);

// --- Lab API ---
export const getLabQueue = () => api.get("/lab/queue");
export const uploadLabReport = (orderedLabTestId, reportUrl) =>
  api.post(`/lab/upload-report/${orderedLabTestId}`, { report_url: reportUrl });

// --- Office API ---
export const addMedicineToStock = (medicineData) =>
  api.post("/office/add-medicine", medicineData);
export const addLabTest = (labTestData) =>
  api.post("/office/add-lab-test", labTestData);
export const getAllMedicines = () => api.get("/office/medicines");
export const getAllLabTests = () => api.get("/office/lab-tests");
export const getDailyVisitReport = () =>
  api.get("/office/reports/daily-visits");
export const getDailyMedicineReport = () =>
  api.get("/office/reports/daily-medicines");
export const getDailyLabTestReport = () =>
  api.get("/office/reports/daily-lab-tests");
