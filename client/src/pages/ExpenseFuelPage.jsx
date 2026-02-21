import { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';

const initialForm = {
  vehicle: '',
  liters: '',
  cost: '',
  date: ''
};

const ExpenseFuelPage = () => {
  const toast = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [costSummary, setCostSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vehicleRes, logRes] = await Promise.all([api.get('/vehicles'), api.get('/fuel')]);
      setVehicles(vehicleRes.data);
      setLogs(logRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createFuelLog = async (event) => {
    event.preventDefault();
    try {
      await api.post('/fuel', {
        ...form,
        liters: Number(form.liters),
        cost: Number(form.cost),
        date: new Date(form.date)
      });
      toast.success('Fuel log added');
      setForm(initialForm);
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add fuel log');
    }
  };

  const fetchCosts = async (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    if (!vehicleId) {
      setCostSummary(null);
      return;
    }

    try {
      const { data } = await api.get(`/fuel/cost/${vehicleId}`);
      setCostSummary(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load cost summary');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Expense & Fuel Logging</h1>
        <p className="text-sm text-slate-500">Track liters, cost, and operational totals</p>
      </div>

      <form onSubmit={createFuelLog} className="card grid gap-3 md:grid-cols-4">
        <select className="input" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
          <option value="">Select Vehicle</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle._id} value={vehicle._id}>
              {vehicle.model} ({vehicle.licensePlate})
            </option>
          ))}
        </select>
        <input className="input" type="number" min="0.1" step="0.1" placeholder="Liters" value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })} required />
        <input className="input" type="number" min="0" step="0.01" placeholder="Cost" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
        <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <button className="btn-primary md:col-span-4">Add Fuel Record</button>
      </form>

      <div className="card grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-sm text-slate-600">Operational Cost by Vehicle</label>
          <select className="input" value={selectedVehicleId} onChange={(e) => fetchCosts(e.target.value)}>
            <option value="">Select Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.model} ({vehicle.licensePlate})
              </option>
            ))}
          </select>
        </div>
        {costSummary && (
          <>
            <div>
              <p className="text-sm text-slate-500">Fuel Cost</p>
              <p className="mt-2 text-xl font-semibold text-indigo-700">${costSummary.totalFuelCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Operational Cost</p>
              <p className="mt-2 text-xl font-semibold text-emerald-700">${costSummary.totalOperationalCost.toFixed(2)}</p>
            </div>
          </>
        )}
      </div>

      {loading ? (
        <Loader text="Loading fuel logs" />
      ) : (
        <div className="table-wrap">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Liters</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">{log.vehicle?.licensePlate}</td>
                  <td className="px-4 py-3">{log.liters}</td>
                  <td className="px-4 py-3">${log.cost}</td>
                  <td className="px-4 py-3">{new Date(log.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseFuelPage;
