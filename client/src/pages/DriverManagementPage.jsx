import { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import StatusPill from '../components/StatusPill';
import { useToast } from '../context/ToastContext';

const initialForm = {
  name: '',
  licenseNumber: '',
  licenseExpiryDate: '',
  status: 'On Duty',
  safetyScore: ''
};

const DriverManagementPage = () => {
  const toast = useToast();
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/drivers');
      setDrivers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const createDriver = async (event) => {
    event.preventDefault();
    try {
      await api.post('/drivers', {
        ...form,
        safetyScore: Number(form.safetyScore || 100),
        licenseExpiryDate: new Date(form.licenseExpiryDate)
      });
      toast.success('Driver created');
      setForm(initialForm);
      fetchDrivers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create driver');
    }
  };

  const removeDriver = async (id) => {
    try {
      await api.delete(`/drivers/${id}`);
      toast.success('Driver deleted');
      fetchDrivers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Delete blocked');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Driver Management</h1>
        <p className="text-sm text-slate-500">Compliance status, safety score and trip readiness</p>
      </div>

      <form onSubmit={createDriver} className="card grid gap-3 md:grid-cols-3">
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="License Number" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required />
        <input className="input" type="date" value={form.licenseExpiryDate} onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })} required />
        <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option>On Duty</option>
          <option>Off Duty</option>
          <option>Suspended</option>
        </select>
        <input className="input" type="number" min="0" max="100" placeholder="Safety Score" value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: e.target.value })} />
        <button className="btn-primary">Add Driver</button>
      </form>

      {loading ? (
        <Loader text="Loading drivers" />
      ) : (
        <div className="table-wrap">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">License Expiry</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Safety Score</th>
                <th className="px-4 py-3">Completion Rate</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver._id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">{driver.name}</td>
                  <td className="px-4 py-3">{new Date(driver.licenseExpiryDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusPill status={driver.status} /></td>
                  <td className="px-4 py-3">{driver.safetyScore}</td>
                  <td className="px-4 py-3">{driver.completionRate || 0}%</td>
                  <td className="px-4 py-3">
                    <button className="btn-secondary" onClick={() => removeDriver(driver._id)}>
                      Delete
                    </button>
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

export default DriverManagementPage;
