import { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import StatusPill from '../components/StatusPill';

const DashboardPage = () => {
  const [filters, setFilters] = useState({ type: '', status: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const { data: response } = await api.get('/dashboard', { params: filters });
      setData(response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [filters.type, filters.status]);

  if (loading) return <Loader text="Loading dashboard" />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Command Center</h1>
        <p className="text-sm text-slate-500">Fleet KPIs and current operational status</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="text-sm text-slate-500">Active Fleet</p>
          <p className="mt-2 text-2xl font-semibold text-indigo-700">{data.kpis.activeFleet}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Maintenance Alerts</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">{data.kpis.maintenanceAlerts}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Utilization Rate</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">{data.kpis.utilizationRate}%</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Pending Cargo</p>
          <p className="mt-2 text-2xl font-semibold text-slate-700">{data.kpis.pendingCargo}</p>
        </div>
      </div>

      <div className="card grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm text-slate-600">Vehicle Type</label>
          <select className="input" value={filters.type} onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}>
            <option value="">All</option>
            <option>Truck</option>
            <option>Van</option>
            <option>Pickup</option>
            <option>Trailer</option>
            <option>Reefer</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600">Status</label>
          <select className="input" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
            <option value="">All</option>
            <option>Available</option>
            <option>On Trip</option>
            <option>In Shop</option>
            <option>Out of Service</option>
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Plate</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.vehicles.map((vehicle) => (
              <tr key={vehicle._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">{vehicle.model}</td>
                <td className="px-4 py-3">{vehicle.licensePlate}</td>
                <td className="px-4 py-3">{vehicle.type}</td>
                <td className="px-4 py-3">{vehicle.maxLoadCapacity}</td>
                <td className="px-4 py-3">
                  <StatusPill status={vehicle.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
