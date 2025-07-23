import { useEffect, useState } from "react";
import apiClient from "../config/axiosConfig";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
  FiClock,
  FiDownload,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { showError, showLoading, dismissToast } from "../utils/toastUtils";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchLogs = async () => {
      const toastId = showLoading("Loading logs...");
      try {
        const res = await apiClient.get("/logs", {
          params: {
            sort: sortOrder === "desc" ? "-createdAt" : "createdAt",
          },
        });
        setLogs(res.data.data);
      } catch (err) {
        showError(err.response?.data?.message || "Failed to fetch logs");
        console.error(err);
      } finally {
        dismissToast(toastId);
        setLoading(false);
      }
    };
    fetchLogs();
  }, [sortOrder]);

  const filteredLogs = logs.filter((log) => {
    if (statusFilter !== "all" && log.statusCode !== parseInt(statusFilter)) {
      return false;
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        log.message?.toLowerCase().includes(searchLower) ||
        log.url?.toLowerCase().includes(searchLower) ||
        log.method?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const getStatusCodeIcon = (statusCode) => {
    if (statusCode >= 500) return <FiAlertCircle className="text-red-500" />;
    if (statusCode >= 400) return <FiAlertTriangle className="text-yellow-500" />;
    return <FiInfo className="text-blue-500" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setSearchTerm("");
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Error Logs</h1>
        <div className="flex gap-2">
          <button onClick={toggleSortOrder} className="btn btn-sm">
            {sortOrder === "desc" ? <FiChevronDown /> : <FiChevronUp />}
            Sort {sortOrder === "desc" ? "Newest" : "Oldest"}
          </button>
          <button onClick={handleClearFilters} className="btn btn-sm" disabled={statusFilter === "all" && !searchTerm}>
            <FiX className="mr-1" />
            Clear
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-muted-400" />
          </div>
          <input
            type="text"
            placeholder="Search logs..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="select select-bordered w-full md:w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status Codes</option>
          <option value="400">400 Bad Request</option>
          <option value="401">401 Unauthorized</option>
          <option value="403">403 Forbidden</option>
          <option value="404">404 Not Found</option>
          <option value="500">500 Server Error</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Status</th>
              <th>Method</th>
              <th>URL</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <FiClock className="animate-spin mr-2" />
                    Loading logs...
                  </div>
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8">
                  No logs found
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log._id} className="hover cursor-pointer" onClick={() => setSelectedLog(log)}>
                  <td>
                    <div className="text-sm opacity-70">{formatDate(log.createdAt || log.timestamp)}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {getStatusCodeIcon(log.statusCode)}
                      <span className="badge">{log.statusCode}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-outline">{log.method || "N/A"}</span>
                  </td>
                  <td className="max-w-xs truncate">{log.url || "N/A"}</td>
                  <td className="max-w-md truncate">{log.message}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">Error Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm opacity-70">Timestamp</p>
                <p>{formatDate(selectedLog.createdAt || selectedLog.timestamp)}</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Status Code</p>
                <div className="flex items-center gap-2">
                  {getStatusCodeIcon(selectedLog.statusCode)}
                  <span className="badge">{selectedLog.statusCode}</span>
                </div>
              </div>
              <div>
                <p className="text-sm opacity-70">Method</p>
                <p>{selectedLog.method || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm opacity-70">URL</p>
                <p className="break-all">{selectedLog.url || "N/A"}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm opacity-70">Message</p>
              <p className="whitespace-pre-wrap">{selectedLog.message}</p>
            </div>

            {selectedLog.errorMessages?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm opacity-70">Validation Errors</p>
                <div className="bg-base-200 p-3 rounded">
                  {selectedLog.errorMessages.map((err, i) => (
                    <div key={i} className="mb-1">
                      <span className="font-semibold">{err.path}:</span> {err.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedLog.stack && (
              <div>
                <p className="text-sm opacity-70">Stack Trace</p>
                <pre className="bg-base-200 p-3 rounded overflow-x-auto text-xs">{selectedLog.stack}</pre>
              </div>
            )}

            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedLog(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Logs;
