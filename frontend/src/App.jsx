
import { useState, useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import {
  Activity,
  FileText,
  Clock,
  CheckCircle,
  LogOut,
  Download,
  ArrowRight
} from "lucide-react";

import Admin from "./Admin";
import StaffLogin from "./StaffLogin";

import "./index.css";
import api from "./services/api";

// ========================================
// PATIENT DASHBOARD
// ========================================

function PatientDashboard() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch reports from FastAPI after login
  useEffect(() => {
    if (!loggedIn) return;

    setLoading(true);

    api
      .get("/api/reports")
      .then((response) => {
        setReports(response.data.reports || []);
        setError("");
      })
      .catch((err) => {
        console.error("Error loading reports:", err);
        setError(
          "Unable to load reports. Please check the backend."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loggedIn]);

  // Send demo OTP
  function sendOtp() {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      alert("Enter a valid 10-digit mobile number.");
      return;
    }

    setOtpSent(true);
  }

  // Verify demo OTP
  function verifyOtp() {
    if (otp === "123456") {
      setLoggedIn(true);
      setError("");
    } else {
      alert("Invalid demo OTP. Please enter 123456.");
    }
  }

  // Patient logout
  function logout() {
    setLoggedIn(false);
    setOtpSent(false);
    setOtp("");
    setReports([]);
    setError("");
  }

  // Report statistics
  const totalReports = reports.length;

  const readyReports = reports.filter(
    (report) => report.status !== "Processing"
  ).length;

  const processingReports = reports.filter(
    (report) => report.status === "Processing"
  ).length;

  // View uploaded PDF
  function viewReport(orderId) {
    const pdfUrl =
      `${api.defaults.baseURL}/api/reports/` +
      `${encodeURIComponent(orderId)}/download`;

    window.open(
      pdfUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  // ========================================
  // PATIENT LOGIN SCREEN
  // ========================================

  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">

          <div className="logo">
            <Activity size={32} />
          </div>

          <h1>Diagnostic Lab Portal</h1>

          <p className="subtitle">
            Access your laboratory reports.
          </p>

          <label>Mobile Number</label>

          <input
            type="tel"
            maxLength={10}
            placeholder="Enter 10-digit mobile number"
            value={mobile}
            onChange={(e) =>
              setMobile(e.target.value)
            }
          />

          {!otpSent ? (
            <button onClick={sendOtp}>
              Send OTP
              <ArrowRight size={18} />
            </button>
          ) : (
            <>
              <label>Enter OTP</label>

              <input
                type="text"
                maxLength={6}
                placeholder="Enter demo OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value)
                }
              />

              <p className="hint">
                Demo OTP: 123456
              </p>

              <button onClick={verifyOtp}>
                Verify and Login
              </button>
            </>
          )}

          <p className="footer-text">
            Your medical information is private.
          </p>

          <p className="hint">
            Demonstration application only.
          </p>

          <p className="hint">
            Staff member?
            {" "}
            <a href="/staff-login">
              Staff Login
            </a>
          </p>

        </div>
      </div>
    );
  }

  // ========================================
  // PATIENT REPORT DASHBOARD
  // ========================================

  return (
    <div className="dashboard">

      <header>
        <div className="brand">
          <Activity size={28} />
          <span>Diagnostic Lab</span>
        </div>

        <button
          className="logout"
          onClick={logout}
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>

      <main>

        <h1>Hello, Lakshmi Prasanna K</h1>

        <p className="subtitle">
          Welcome to your laboratory report dashboard.
        </p>

        {/* STATISTICS */}

        <div className="stats">

          <div className="stat-card">
            <FileText />
            <h2>{totalReports}</h2>
            <p>Total Reports</p>
          </div>

          <div className="stat-card">
            <CheckCircle />
            <h2>{readyReports}</h2>
            <p>Ready / Critical</p>
          </div>

          <div className="stat-card">
            <Clock />
            <h2>{processingReports}</h2>
            <p>Processing</p>
          </div>

        </div>

        <h2 className="section-title">
          My Lab Reports
        </h2>

        {/* LOADING */}

        {loading && (
          <p>Loading reports...</p>
        )}

        {/* ERROR */}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {/* EMPTY STATE */}

        {!loading &&
          !error &&
          reports.length === 0 && (
            <p>No reports available.</p>
          )}

        {/* REPORT LIST */}

        <div className="report-list">

          {reports.map((report) => {
            const status = (
              report.status || ""
            ).toLowerCase();

            const statusClass = status.includes("critical")
              ? "critical"
              : status === "processing"
                ? "processing"
                : "ready";

            return (
              <div
                className="report-card"
                key={report.order_id}
              >

                <div>
                  <h3>{report.test}</h3>

                  <p>
                    Order: {report.order_id}
                  </p>

                  <p>
                    Patient: {report.patient}
                  </p>

                  <p>
                    Result: {report.result}
                  </p>

                  <p>
                    Status: {report.status}
                  </p>
                </div>

                <div className="report-action">

                  <span
                    className={
                      "status " + statusClass
                    }
                  >
                    {report.status}
                  </span>

                  {statusClass !== "processing" && (
                    <button
                      className="download"
                      onClick={() =>
                        viewReport(report.order_id)
                      }
                    >
                      <Download size={16} />
                      View Report
                    </button>
                  )}

                </div>

              </div>
            );
          })}

        </div>

      </main>
    </div>
  );
}

// ========================================
// PROTECTED ADMIN ROUTE (DEMO ONLY)
// ========================================

function ProtectedAdmin() {
  const isStaffLoggedIn =
    sessionStorage.getItem("staffLoggedIn") === "true";

  if (!isStaffLoggedIn) {
    return <Navigate to="/staff-login" replace />;
  }

  return <Admin />;
}

// ========================================
// MAIN APPLICATION ROUTING
// ========================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Patient Portal */}
        <Route
          path="/"
          element={<PatientDashboard />}
        />

        {/* Staff Login */}
        <Route
          path="/staff-login"
          element={<StaffLogin />}
        />

        {/* Staff Dashboard */}
        <Route
          path="/admin"
          element={<ProtectedAdmin />}
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
