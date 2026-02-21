import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import StatusPill from '../components/StatusPill';
import { useToast } from '../context/ToastContext';

const initialForm = {
  vehicle: '',
  serviceType: '',
  notes: '',
  cost: '',
  serviceDate: ''
};

const MaintenancePage = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);

  const serviceableVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status !== 'On Trip' && vehicle.status !== 'Out of Service'),
    [vehicles]
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logRes, vehicleRes] = await Promise.all([api.get('/maintenance'), api.get('/vehicles')]);
      setLogs(logRes.data);
      setVehicles(vehicleRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createLog = async (event) => {
    event.preventDefault();
    try {
      await api.post('/maintenance', {
        ...form,
        cost: Number(form.cost),
        serviceDate: new Date(form.serviceDate)
      });
      setForm(initialForm);
      toast.success('Maintenance log created and vehicle moved to shop');
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create maintenance log');
    }
  };

  const resolveLog = async (logId) => {
    try {
      await api.patch(`/maintenance/${logId}/resolve`);
      toast.info('Maintenance log resolved');
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Resolve failed');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Maintenance & Service Logs</h1>
        <p className="text-sm text-slate-500">Move vehicles in and out of service workflow</p>
      </div>

      <form onSubmit={createLog} className="card grid gap-3 md:grid-cols-3">
        <select className="input" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
          <option value="">Select Vehicle</option>
          {serviceableVehicles.map((vehicle) => (
            <option key={vehicle._id} value={vehicle._id}>
              {vehicle.model} ({vehicle.licensePlate})
            </option>
          ))}
        </select>
        <input className="input" placeholder="Service Type" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} required />
        <input className="input" type="date" value={form.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })} required />
        <input className="input" type="number" min="0" placeholder="Cost" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
        <input className="input md:col-span-2" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className="btn-primary">Add to Service</button>
      </form>

      {loading ? (
        <Loader text="Loading maintenance logs" />
      ) : (
        <div className="table-wrap">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">{log.vehicle?.licensePlate}</td>
                  <td className="px-4 py-3">{log.serviceType}</td>
                  <td className="px-4 py-3">{new Date(log.serviceDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">${log.cost}</td>
                  <td className="px-4 py-3"><StatusPill status={log.resolved ? 'Completed' : 'In Shop'} /></td>
                  <td className="px-4 py-3">
                    {!log.resolved && (
                      <button className="btn-secondary" onClick={() => resolveLog(log._id)}>
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
