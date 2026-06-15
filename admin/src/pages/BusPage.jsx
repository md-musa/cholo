import React, { useState, useEffect } from "react";
import apiClient from "../config/axiosConfig";
import { showSuccess, showError, showLoading, dismissToast } from "../utils/toastUtils";
import { BUS_STATUS, BUS_TYPES } from "../constants";

const BusPage = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    busType: BUS_TYPES.STUDENT,
    capacity: "",
    status: BUS_STATUS.ACTIVE,
  });

  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const loadingToast = showLoading("Loading data...");

      // Fetch buses
      const busesResponse = await apiClient.get("/buses");
      setBuses(busesResponse.data.data);

      // Fetch routes for dropdown
      const routesResponse = await apiClient.get("/routes");
      setRoutes(routesResponse.data.data);

      dismissToast(loadingToast);
      showSuccess("Data loaded successfully");
    } catch (err) {
      dismissToast();
      showError(err.response?.data?.message || "Failed to load data");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = showLoading(editId ? "Updating bus..." : "Creating bus...");

    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        name: form.name.toLowerCase().trim(),
      };

      if (editId) {
        await apiClient.put(`/buses/${editId}`, payload);
        showSuccess("Bus updated successfully");
      } else {
        await apiClient.post(`/buses`, payload);
        showSuccess("Bus created successfully");
      }

      fetchData();
      resetForm();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to save bus");
      console.error("Save bus error:", err);
    } finally {
      dismissToast(loadingToast);
    }
  };

  const handleEdit = (bus) => {
    setForm({
      name: bus.name,
      busType: bus.busType,
      capacity: bus.capacity.toString(),
      status: bus.status,
      assignedRouteId: bus.assignedRouteId?._id || "",
      assignedDriverId: bus.assignedDriverId?._id || "",
    });
    setEditId(bus._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm({
      name: "",
      busType: BUS_TYPES.STUDENT,
      capacity: "",
      status: BUS_STATUS.ACTIVE,
      assignedRouteId: "",
      assignedDriverId: "",
    });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bus?")) return;

    const loadingToast = showLoading("Deleting bus...");
    try {
      await apiClient.delete(`/buses/${id}`);
      showSuccess("Bus deleted successfully");
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete bus");
      console.error("Delete bus error:", err);
    } finally {
      dismissToast(loadingToast);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Add Bus</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Bus Name*</span>
            </label>
            <input
              type="text"
              placeholder="Bus Name"
              className="input input-bordered w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Bus Type*</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={form.busType}
              onChange={(e) => setForm({ ...form, busType: e.target.value })}
              required
            >
              {Object.values(BUS_TYPES).map((type) => (
                <option className="capitalize" key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Capacity*</span>
            </label>
            <input
              type="number"
              placeholder="Passenger Capacity"
              className="input input-bordered w-full"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              min="1"
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {Object.values(BUS_STATUS).map((status) => (
                <option className="capitalize" key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Assigned Route</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={form.assignedRouteId}
              onChange={(e) => setForm({ ...form, assignedRouteId: e.target.value })}
            >
              <option value="">Select Route (Optional)</option>
              {routes.map((route) => (
                <option key={route._id} value={route._id}>
                  {route.name} ({route.startLocation} to {route.endLocation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Assigned Driver</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={form.assignedDriverId}
              onChange={(e) => setForm({ ...form, assignedDriverId: e.target.value })}
            >
              <option value="">Select Driver (Optional)</option>
              {drivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.name} ({driver.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-2">
          <button type="submit" className="btn btn-primary">
            {editId ? "Update Bus" : "Add Bus"}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="btn btn-outline">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Route</th>
                <th>Driver</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus, index) => (
                <tr key={bus._id}>
                  <td>{index + 1}</td>
                  <td className="font-medium capitalize">{bus.name}</td>
                  <td className="capitalize">{bus.busType}</td>
                  <td className="capitalize">{bus.capacity}</td>
                  <td>
                    <span
                      className={`badge capitalize ${
                        bus.status === BUS_STATUS.ACTIVE
                          ? "badge-success"
                          : bus.status === BUS_STATUS.MAINTENANCE
                          ? "badge-warning"
                          : "badge-error"
                      }`}
                    >
                      {bus.status}
                    </span>
                  </td>
                  <td>{bus.assignedRouteId?.name || "-"}</td>
                  <td>{bus.assignedDriverId?.name || "-"}</td>
                  <td className="flex space-x-1">
                    <button onClick={() => handleEdit(bus)} className="btn btn-sm btn-outline btn-info">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(bus._id)} className="btn btn-sm btn-outline btn-error">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {buses.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center">
                    No buses found. Create your first bus above.
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

export default BusPage;
