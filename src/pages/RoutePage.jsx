import React, { useState, useEffect } from "react";
import apiClient from "../config/axiosConfig";
import { showSuccess, showError, showLoading, dismissToast } from "../utils/toastUtils";

const RoutePage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    routeNo: "",
    routeName: "",
    totalDistance: "",
    estimatedTime: "",
  });
  const [editId, setEditId] = useState(null);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const loadingToast = showLoading("Fetching routes...");
      const response = await apiClient.get("/routes");
      setRoutes(response.data.data);
      dismissToast(loadingToast);
      showSuccess("Routes loaded successfully");
    } catch (err) {
      dismissToast();
      showError(err.response?.data?.message || "Failed to fetch routes");
      console.error("Fetch routes error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = showLoading(editId ? "Updating route..." : "Creating route...");

    try {
      const payload = {
        ...form,
        totalDistance: form.totalDistance ? parseFloat(form.totalDistance) : undefined,
        estimatedTime: form.estimatedTime ? parseInt(form.estimatedTime) : undefined,
      };
      console.log("Payload:", payload);

      if (editId) {
        await apiClient.put(`/routes/${editId}`, payload);
        showSuccess("Route updated successfully");
      } else {
        await apiClient.post(`/routes`, payload);
        showSuccess("Route created successfully");
      }

      fetchRoutes();
      resetForm();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to save route");
      console.error("Save route error:", err);
    } finally {
      dismissToast(loadingToast);
    }
  };

  const handleEdit = (route) => {
    setForm({
      routeNo: route.routeNo,
      routeName: route.routeName,
      totalDistance: route.totalDistance || "",
      estimatedTime: route.estimatedTime || "",
    });
    setEditId(route._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm({
      routeNo: "",
      routeName: "",
      totalDistance: "",
      estimatedTime: "",
    });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;

    const loadingToast = showLoading("Deleting route...");
    try {
      await apiClient.delete(`/routes/${id}`);
      showSuccess("Route deleted successfully");
      fetchRoutes();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete route");
      console.error("Delete route error:", err);
    } finally {
      dismissToast(loadingToast);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Add Route</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Route No.*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: R1, R2 format"
              className="input input-bordered w-full"
              value={form.routeNo}
              onChange={(e) => setForm({ ...form, routeNo: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Route Name*</span>
            </label>
            <input
              type="text"
              placeholder="Start Location"
              className="input input-bordered w-full"
              value={form.routeName}
              onChange={(e) => setForm({ ...form, routeName: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Total Distance (km)</span>
            </label>
            <input
              type="number"
              placeholder="Total Distance"
              className="input input-bordered w-full"
              value={form.totalDistance}
              onChange={(e) => setForm({ ...form, totalDistance: e.target.value })}
              min="0"
              step="0.1"
              reequired
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Estimated Time (minutes)</span>
            </label>
            <input
              type="number"
              placeholder="Estimated Time"
              className="input input-bordered w-full"
              value={form.estimatedTime}
              onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })}
              min="0"
              required
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <button type="submit" className="btn btn-primary">
            {editId ? "Update Route" : "Add Route"}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="btn btn-outline">
              Cancel
            </button>
          )}
        </div>
      </form>
      <hr className="border-gray-300 border" />

      <h2 className="text-2xl font-bold my-5">Routes List</h2>
      {loading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Route No</th>
                <th>Route Name</th>
                <th>Distance</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route, index) => (
                <tr key={route._id}>
                  <td>{route.routeNo}</td>
                  <td>{route.routeName}</td>
                  <td>{route.totalDistance || "-"} km</td>
                  <td>{route.estimatedTime || "-"} min</td>
                  <td className="flex space-x-1">
                    <button onClick={() => handleEdit(route)} className="btn btn-sm btn-outline btn-info">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(route._id)} className="btn btn-sm btn-outline btn-error">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">
                    No routes found. Create your first route above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RoutePage;
