
import { useEffect, useState } from "react";

import {
  Activity,
  Search,
  Upload,
  FileText,
  RefreshCw,
  LogOut
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api from "./services/api";

function Admin() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // Load reports from FastAPI
  async function loadReports() {
    try {
      setLoading(true);

      const response = await api.get("/api/reports");

      setReports(response.data.reports || []);
      setMessage("");
    } catch (error) {
      console.error("Error loading reports:", error);

      setMessage(
        "Unable to load reports. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  // Load reports when page opens
  useEffect(() => {
    loadReports();
  }, []);

  // Upload PDF report
  async function uploadReport(orderId, file) {
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setMessage("Please select a PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("PDF file must be smaller than 10 MB.");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    try {
      setMessage("Uploading PDF...");

      await api.post(
        `/api/reports/${encodeURIComponent(orderId)}/upload`,
        formData
      );

      setMessage("PDF uploaded successfully!");

      await loadReports();

    } catch (error) {
      console.error("PDF upload error:", error);

      setMessage(
        error.response?.data?.detail ||
        "PDF upload failed. Please try again."
      );
    }
  }

  // Search reports
  const filteredReports = reports.filter((report) => {
    const searchText = search.toLowerCase();

    return (
      report.patient?.toLowerCase().includes(searchText) ||
      report.order_id?.toLowerCase().includes(searchText) ||
      report.test?.toLowerCase().includes(searchText)
    );
  });

  // Staff logout
  function logout() {
    sessionStorage.removeItem("staffLoggedIn");
    navigate("/staff-login", { replace: true });
  }

  // Admin dashboard
  return (
    <div className="dashboard">

      {/* HEADER */}
      <header>
        <div className="brand">
          <Activity size={28} />
          <span>Diagnostic Lab — Staff Portal</span>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>

          <button
            className="logout"
            onClick={loadReports}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            className="logout"
            onClick={logout}
          >
            <LogOut size={16} />
            Logout
          </button>

        </div>
      </header>

      <main>

        <h1>Staff Dashboard</h1>

        <p className="subtitle">
          Search patient reports and upload laboratory PDF files.
        </p>

        {/* SEARCH BOX */}
        <div className="search-box">

          <Search size={20} />

          <input
            type="text"
            placeholder="Search by patient, order ID or test..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* STATUS MESSAGE */}
        {message && (
          <p className="hint">{message}</p>
        )}

        {/* REPORTS */}
        {loading ? (
          <p>Loading reports...</p>
        ) : (
          <>

            <h2 className="section-title">
              Reports ({filteredReports.length})
            </h2>

            <div className="report-list">

              {filteredReports.map((report) => (

                <div
                  className="report-card"
                  key={report.order_id}
                >

                  <div>

                    <h3>
                      <FileText size={18} />
                      {" "}
                      {report.test}
                    </h3>

                    <p>
                      Patient: {report.patient}
                    </p>

                    <p>
                      Order ID: {report.order_id}
                    </p>

                    <p>
                      Result: {report.result}
                    </p>

                    <p>
                      Status: {report.status}
                    </p>

                  </div>

                  <div className="report-action">

                    <label className="download">

                      <Upload size={16} />

                      Upload PDF

                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        hidden
                        onChange={(e) => {
                          uploadReport(
                            report.order_id,
                            e.target.files?.[0]
                          );

                          e.target.value = "";
                        }}
                      />

                    </label>

                  </div>

                </div>

              ))}

              {filteredReports.length === 0 && (
                <p>No matching reports found.</p>
              )}

            </div>

          </>
        )}

      </main>

    </div>
  );
}

export default Admin;
