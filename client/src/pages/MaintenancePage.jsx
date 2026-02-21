import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FloatingInput from '../components/ui/FloatingInput';
import FloatingSelect from '../components/ui/FloatingSelect';
import StatusBadge from '../components/ui/StatusBadge';
import Table from '../components/ui/Table';

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
        <h1 className="section-title">Maintenance & Service Logs</h1>
        <p className="section-subtitle">Move vehicles in and out of service workflow</p>
      </div>

      <Card>
        <form onSubmit={createLog} className="grid gap-3 md:grid-cols-3">
          <FloatingSelect label="Vehicle" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
            <option value="">Select Vehicle</option>
            {serviceableVehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.model} ({vehicle.licensePlate})
              </option>
            ))}
          </FloatingSelect>
          <FloatingInput label="Service Type" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} required />
          <FloatingInput type="date" label="Service Date" value={form.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })} required />
          <FloatingInput type="number" min="0" label="Cost" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
          <FloatingInput className="md:col-span-2" label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex items-end">
            <Button className="w-full">Add to Service</Button>
          </div>
        </form>
      </Card>

      {loading && <Loader text="Loading maintenance logs" />}

      <Table
        title="Service Activity"
        description="Track in-shop time and maintenance resolution"
        loading={loading}
        columns={[
          { key: 'vehicle', label: 'Vehicle', render: (row) => row.vehicle?.licensePlate || '-' },
          { key: 'serviceType', label: 'Service' },
          { key: 'serviceDate', label: 'Date', render: (row) => new Date(row.serviceDate).toLocaleDateString() },
          { key: 'cost', label: 'Cost', render: (row) => `$${row.cost}` },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.resolved ? 'Completed' : 'In Shop'} /> },
          {
            key: 'action',
            label: 'Action',
            render: (row) =>
              !row.resolved ? (
                <Button variant="secondary" className="!rounded-xl !px-2.5 !py-1.5" onClick={() => resolveLog(row._id)}>
                  Resolve
                </Button>
              ) : (
                <span className="text-xs text-slate-500">Resolved</span>
              )
          }
        ]}
        rows={logs}
        getRowId={(row) => row._id}
        searchKeys={['serviceType', 'notes']}
      />
    </div>
  );
};

export default MaintenancePage;
