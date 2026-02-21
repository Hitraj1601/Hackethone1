import { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FloatingInput from '../components/ui/FloatingInput';
import FloatingSelect from '../components/ui/FloatingSelect';
import Table from '../components/ui/Table';

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
        <h1 className="section-title">Expense & Fuel Logging</h1>
        <p className="section-subtitle">Track liters, cost, and operational totals</p>
      </div>

      <Card>
        <form onSubmit={createFuelLog} className="grid gap-3 md:grid-cols-4">
          <FloatingSelect label="Vehicle" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
            <option value="">Select Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.model} ({vehicle.licensePlate})
              </option>
            ))}
          </FloatingSelect>
          <FloatingInput type="number" min="0.1" step="0.1" label="Liters" value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })} required />
          <FloatingInput type="number" min="0" step="0.01" label="Cost" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
          <FloatingInput type="date" label="Date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <div className="md:col-span-4 flex justify-end">
            <Button>Add Fuel Record</Button>
          </div>
        </form>
      </Card>

      <Card className="grid gap-3 md:grid-cols-2 lg:grid-cols-4" glow>
        <div className="lg:col-span-2">
          <FloatingSelect label="Operational Cost by Vehicle" value={selectedVehicleId} onChange={(e) => fetchCosts(e.target.value)}>
            <option value="">Select Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.model} ({vehicle.licensePlate})
              </option>
            ))}
          </FloatingSelect>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Fuel Cost</p>
          <p className="mt-2 text-2xl font-semibold text-indigo-600 dark:text-indigo-300">
            ${costSummary ? costSummary.totalFuelCost.toFixed(2) : '0.00'}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Operational Cost</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
            ${costSummary ? costSummary.totalOperationalCost.toFixed(2) : '0.00'}
          </p>
        </div>
      </Card>

      {loading && <Loader text="Loading fuel logs" />}

      <Table
        title="Fuel Logs"
        description="Cost tracking with searchable history"
        loading={loading}
        columns={[
          { key: 'vehicle', label: 'Vehicle', render: (row) => row.vehicle?.licensePlate || '-' },
          { key: 'liters', label: 'Liters' },
          { key: 'cost', label: 'Cost', render: (row) => `$${row.cost}` },
          { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() }
        ]}
        rows={logs}
        getRowId={(row) => row._id}
        searchKeys={['liters', 'cost']}
      />
    </div>
  );
};

export default ExpenseFuelPage;
