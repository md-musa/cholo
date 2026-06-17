import React, { useState, useEffect } from "react";
import apiClient from "../config/axiosConfig";
import { showSuccess, showError, showLoading, dismissToast } from "../utils/toastUtils";
import {
  FaRoute,
  FaUserGraduate,
  FaUserTie,
  FaCalendarAlt,
  FaExchangeAlt,
  FaClock,
  FaStickyNote,
  FaBus,
} from "react-icons/fa";
import { MdDirectionsBus } from "react-icons/md";
import { SCHEDULE_DIRECTIONS, SCHEDULE_MODES, SCHEDULE_OPERATING_DAYS, SCHEDULE_USER_TYPES } from "../constants";
import { formatTime, getEnumLabel, groupSchedule } from "../utils/scheduleutil";

const AddSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState(SCHEDULE_MODES.REGULAR);
  const [selectedRoute, setSelectedRoute] = useState("");

  const [form, setForm] = useState({
    routeId: "",
    direction: SCHEDULE_DIRECTIONS.TO_CAMPUS,
    time: "",
    userType: SCHEDULE_USER_TYPES.STUDENT,
    mode: SCHEDULE_MODES.REGULAR,
    operatingDays: SCHEDULE_OPERATING_DAYS.WEEKDAYS,
    note: "",
    serviceType: "",
  });

  console.log(form);

  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const loadingToast = showLoading("Loading schedules...");
      // if (!selectedRoute) return;

      const schedulesResponse = await apiClient.get("/schedules", {
        params: {
          routeId: selectedRoute || undefined,
        },
      });
      setSchedules(schedulesResponse.data.data);

      const routesResponse = await apiClient.get("/routes");
      setRoutes(routesResponse.data.data);

      dismissToast(loadingToast);
      showSuccess("Schedules loaded successfully");
    } catch (err) {
      dismissToast();
      showError(err.response?.data?.message || "Failed to load schedules");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRoute]);

  // Filter schedules based on selections
  const filteredSchedules = schedules.filter((schedule) => {
    return schedule.mode === selectedMode && (selectedRoute === "" || schedule.routeId?._id === selectedRoute);
  });

  // Group schedules hierarchically
  const groupedSchedules = groupSchedule(filteredSchedules);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = showLoading(editId ? "Updating schedule..." : "Creating schedule...");

    try {
      const payload = {
        ...form,
      };

      if (editId) {
        await apiClient.put(`/schedules/${editId}`, payload);
        showSuccess("Schedule updated successfully");
      } else {
        await apiClient.post(`/schedules`, payload);
        showSuccess("Schedule created successfully");
      }

      fetchData();
      // resetForm();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to save schedule");
      console.error("Save schedule error:", err);
    } finally {
      dismissToast(loadingToast);
    }
  };

  const handleEdit = (schedule) => {
    setForm({
      routeId: schedule.routeId._id || schedule.routeId,
      direction: schedule.direction,
      time: schedule.time,
      userType: schedule.userType,
      mode: schedule.mode,
      operatingDays: schedule.operatingDays,
      note: schedule.note || "",
      serviceType: schedule.serviceType || "",
    });
    setEditId(schedule._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm({
      routeId: "",
      direction: SCHEDULE_DIRECTIONS.TO_CAMPUS,
      time: "",
      userType: SCHEDULE_USER_TYPES.STUDENT,
      mode: SCHEDULE_MODES.REGULAR,
      operatingDays: SCHEDULE_OPERATING_DAYS.WEEKDAYS,
      note: "",
      serviceType: "",
    });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;

    const loadingToast = showLoading("Deleting schedule...");
    try {
      await apiClient.delete(`/schedules/${id}`);
      showSuccess("Schedule deleted successfully");
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete schedule");
      console.error("Delete schedule error:", err);
    } finally {
      dismissToast(loadingToast);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MdDirectionsBus className="text-blue-500" /> Add Schedule
      </h2>

      {/*-------Schedule Form (keep your existing form) ---------*/}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">
          <h3 className="card-title">{editId ? "Edit Schedule" : "Add New Schedule"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Route*</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={form.routeId}
                  onChange={(e) => setForm({ ...form, routeId: e.target.value })}
                  required
                >
                  <option value="">Select Route</option>
                  {routes.map((route) => (
                    <option key={route._id} value={route._id}>
                      {route.routeNo + ": " + route.routeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Direction*</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={form.direction}
                  onChange={(e) => setForm({ ...form, direction: e.target.value })}
                  required
                >
                  {Object.values(SCHEDULE_DIRECTIONS).map((direction) => (
                    <option key={direction} value={direction}>
                      {getEnumLabel(direction, SCHEDULE_DIRECTIONS)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Time* (HH:mm)</span>
                </label>
                <input
                  type="time"
                  placeholder="08:30 AM/PM"
                  className="input input-bordered w-full"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">User Type*</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={form.userType}
                  onChange={(e) => setForm({ ...form, userType: e.target.value })}
                  required
                >
                  {Object.values(SCHEDULE_USER_TYPES).map((type) => (
                    <option key={type} value={type}>
                      {getEnumLabel(type, SCHEDULE_USER_TYPES)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Mode*</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={form.mode}
                  onChange={(e) => setForm({ ...form, mode: e.target.value })}
                  required
                >
                  {Object.values(SCHEDULE_MODES).map((mode) => (
                    <option key={mode} value={mode}>
                      {getEnumLabel(mode, SCHEDULE_MODES)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Operating Days*</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={form.operatingDays}
                  onChange={(e) => setForm({ ...form, operatingDays: e.target.value })}
                  required
                >
                  {Object.values(SCHEDULE_OPERATING_DAYS).map((days) => (
                    <option key={days} value={days}>
                      {getEnumLabel(days, SCHEDULE_OPERATING_DAYS)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Note</span>
              </label>
              <input
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                type="text"
                placeholder="Ex. The bus will go up to Mirpur-10"
                className="input input-bordered w-full"
                value={form.note}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Service Type</span>
              </label>
              <input
                type="text"
                placeholder="Ex. Shuttle Service"
                className="input input-bordered w-full"
                value={form.serviceType}
                onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
              />
            </div>

            <div className="flex space-x-2">
              <button type="submit" className="btn btn-primary">
                {editId ? "Update Schedule" : "Add Schedule"}
              </button>
              {editId && (
                <button type="button" onClick={resetForm} className="btn btn-outline">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ---------- Schedule -------- */}
      <hr className="border-t-2 border-gray-300 my-10" />
      <h2 className="text-2xl text-center font-bold mb-6 flex items-center gap-2">
        <MdDirectionsBus className="text-blue-500" /> View Schedule
      </h2>
      {/* Mode and Route Selection */}
      <div className="bg-base-200 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <FaCalendarAlt /> Schedule Mode
              </span>
            </label>
            <select
              className="select select-bordered w-full"
              value={selectedMode}
              onChange={(e) => {
                setSelectedMode(e.target.value);
                setSelectedRoute("");
              }}
            >
              {Object.values(SCHEDULE_MODES).map((mode) => (
                <option key={mode} value={mode}>
                  {getEnumLabel(mode)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <FaRoute /> Select Route
              </span>
            </label>

            <select
              className="select select-bordered w-full"
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
            >
              <option value="">Select Route</option>
              {routes.map((route) => (
                <option key={route._id} value={route._id}>
                  {route.routeNo + ": " + route.routeName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Grouped Schedule Display */}
      {loading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(groupedSchedules).length > 0 ? (
            Object.entries(groupedSchedules).map(([routeId, group]) => (
              <div key={routeId} className="card bg-base-100 shadow-lg">
                <div className="card-body p-0">
                  <div className="bg-primary text-primary-content p-4 rounded-t-lg">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <FaRoute /> {group.route?.name || "Unknown Route"}
                    </h3>
                    <p className="text-sm opacity-90">
                      {group.route?.startLocation} to {group.route?.endLocation}
                    </p>
                  </div>

                  <div className="p-4">
                    {/* Student Schedules */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
                        <FaUserGraduate className="text-blue-600" />
                        <span>Student Schedules</span>
                      </div>
                      <hr className="border-t-2 border-muted-300 mb-4" />

                      <div className="grid grid-cols-2">
                        {/* Weekdays */}
                        <div className="ml-4 mb-6">
                          <div className="flex items-center justify-center gap-2 mb-2 text-md font-medium">
                            <FaCalendarAlt className="text-green-600" />
                            <span>Weekdays</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 ml-6">
                            {/* To Campus */}
                            <div className="bg-base-200 p-3 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <FaExchangeAlt className="text-green-500 rotate-90" />
                                <span>To Campus</span>
                                <span className="badge badge-sm">{group.students.weekdays.to.length} trips</span>
                              </div>
                              <div className="space-y-2">
                                {group.students.weekdays.to
                                  .sort((a, b) => a.time.localeCompare(b.time))
                                  .map((schedule) => (
                                    <ScheduleItem
                                      key={schedule._id}
                                      schedule={schedule}
                                      onEdit={handleEdit}
                                      onDelete={handleDelete}
                                    />
                                  ))}
                              </div>
                            </div>

                            {/* From Campus */}
                            <div className="bg-base-200 p-3 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <FaExchangeAlt className="text-green-500 -rotate-90" />
                                <span>From Campus</span>
                                <span className="badge badge-sm">{group.students.weekdays.from.length} trips</span>
                              </div>
                              <div className="space-y-2">
                                {group.students.weekdays.from
                                  .sort((a, b) => a.time.localeCompare(b.time))
                                  .map((schedule) => (
                                    <ScheduleItem
                                      key={schedule._id}
                                      schedule={schedule}
                                      onEdit={handleEdit}
                                      onDelete={handleDelete}
                                    />
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Friday */}
                        <div className="ml-4 mb-6">
                          <div className="flex items-center justify-center gap-2 mb-2 text-md font-medium">
                            <FaCalendarAlt className="text-purple-600" />
                            <span>Friday</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                            {/* To Campus */}
                            <div className="bg-base-200 p-3 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <FaExchangeAlt className="text-green-500 rotate-90" />
                                <span>To Campus</span>
                                <span className="badge badge-sm">{group.students.friday.to.length} trips</span>
                              </div>
                              <div className="space-y-2">
                                {group.students.friday.to
                                  .sort((a, b) => a.time.localeCompare(b.time))
                                  .map((schedule) => (
                                    <ScheduleItem
                                      key={schedule._id}
                                      schedule={schedule}
                                      onEdit={handleEdit}
                                      onDelete={handleDelete}
                                    />
                                  ))}
                              </div>
                            </div>

                            {/* From Campus */}
                            <div className="bg-base-200 p-3 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <FaExchangeAlt className="text-green-500 -rotate-90" />
                                <span>From Campus</span>
                                <span className="badge badge-sm">{group.students.friday.from.length} trips</span>
                              </div>
                              <div className="space-y-2">
                                {group.students.friday.from
                                  .sort((a, b) => a.time.localeCompare(b.time))
                                  .map((schedule) => (
                                    <ScheduleItem
                                      key={schedule._id}
                                      schedule={schedule}
                                      onEdit={handleEdit}
                                      onDelete={handleDelete}
                                    />
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Employee Schedules */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
                        <FaUserTie className="text-blue-600" />
                        <span>Employee Schedules</span>
                      </div>
                      <hr className="border-t-2 border-muted-300 mb-4" />

                      <div className="grid grid-cols-2">
                        {/* Weekdays */}
                        <div className="ml-4 mb-6">
                          <div className="flex items-center justify-center gap-2 mb-2 text-md font-medium">
                            <FaCalendarAlt className="text-green-600" />
                            <span>Weekdays</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                            {/* To Campus */}
                            <div className="bg-base-200 p-3 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <FaExchangeAlt className="text-green-500 rotate-90" />
                                <span>To Campus</span>
                                <span className="badge badge-sm">{group.employees.weekdays.to.length} trips</span>
                              </div>
                              <div className="space-y-2">
                                {group.employees.weekdays.to
                                  .sort((a, b) => a.time.localeCompare(b.time))
                                  .map((schedule) => (
                                    <ScheduleItem
                                      key={schedule._id}
                                      schedule={schedule}
                                      onEdit={handleEdit}
                                      onDelete={handleDelete}
                                    />
                                  ))}
                              </div>
                            </div>
                            {/* From Campus */}
                            <div className="bg-base-200 p-3 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <FaExchangeAlt className="text-green-500 -rotate-90" />
                                <span>From Campus</span>
                                <span className="badge badge-sm">{group.employees.weekdays.from.length} trips</span>
                              </div>
                              <div className="space-y-2">
                                {group.employees.weekdays.from
                                  .sort((a, b) => a.time.localeCompare(b.time))
                                  .map((schedule) => (
                                    <ScheduleItem
                                      key={schedule._id}
                                      schedule={schedule}
                                      onEdit={handleEdit}
                                      onDelete={handleDelete}
                                    />
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Friday */}
                        <div className="ml-4">
                          <div className="flex items-center justify-center gap-2 mb-2 text-md font-medium">
                            <FaCalendarAlt className="text-purple-600" />
                            <span>Friday</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                            {/* To Campus */}
                            <div className="bg-base-200 p-3 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <FaExchangeAlt className="text-green-500 rotate-90" />
                                <span>To Campus</span>
                                <span className="badge badge-sm">{group.employees.friday.to.length} trips</span>
                              </div>
                              <div className="space-y-2">
                                {group.employees.friday.to
                                  .sort((a, b) => a.time.localeCompare(b.time))
                                  .map((schedule) => (
                                    <ScheduleItem
                                      key={schedule._id}
                                      schedule={schedule}
                                      onEdit={handleEdit}
                                      onDelete={handleDelete}
                                    />
                                  ))}
                              </div>
                            </div>
                            {/* From Campus */}
                            <div className="bg-base-200 p-3 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <FaExchangeAlt className="text-green-500 -rotate-90" />
                                <span>From Campus</span>
                                <span className="badge badge-sm">{group.employees.friday.from.length} trips</span>
                              </div>
                              <div className="space-y-2">
                                {group.employees.friday.from
                                  .sort((a, b) => a.time.localeCompare(b.time))
                                  .map((schedule) => (
                                    <ScheduleItem
                                      key={schedule._id}
                                      schedule={schedule}
                                      onEdit={handleEdit}
                                      onDelete={handleDelete}
                                    />
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8 bg-base-200 rounded-lg">
              <div className="flex flex-col items-center justify-center gap-4">
                <FaBus className="text-4xl opacity-50" />
                <p className="text-lg">No schedules found for the selected mode and route</p>
                <button
                  onClick={() => {
                    setSelectedRoute("");
                  }}
                  className="btn btn-primary mt-2"
                >
                  Show All Routes
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Separate component for schedule items
const ScheduleItem = ({ schedule, onEdit, onDelete }) => {
  return (
    <div className="flex justify-between items-center bg-base-100 p-2 rounded shadow-sm">
      <div className="">
        <div className="flex items-center gap-1 font-mono">
          <FaClock className="text-blue-500" />
          <span>{schedule.time}</span>
        </div>
        {schedule.note && (
          <div className="flex items-center gap-1 text-[10px]">
            <FaStickyNote className="text-yellow-500" />
            <span>{schedule.note}</span>
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <button onClick={() => onEdit(schedule)} className="btn btn-xs btn-outline btn-info">
          Edit
        </button>
        <button onClick={() => onDelete(schedule._id)} className="btn btn-xs btn-outline btn-error">
          Delete
        </button>
      </div>
    </div>
  );
};

export default AddSchedule;
