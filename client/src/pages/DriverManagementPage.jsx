import { useEffect, useState } from 'react';
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
        <h1 className="section-title">Driver Management</h1>
        <p className="section-subtitle">Compliance status, safety score and trip readiness</p>
      </div>

      <Card>
        <form onSubmit={createDriver} className="grid gap-3 md:grid-cols-3">
          <FloatingInput label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <FloatingInput label="License Number" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required />
          <FloatingInput type="date" label="License Expiry" value={form.licenseExpiryDate} onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })} required />
          <FloatingSelect label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>On Duty</option>
            <option>Off Duty</option>
            <option>Suspended</option>
          </FloatingSelect>
          <FloatingInput type="number" min="0" max="100" label="Safety Score" value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: e.target.value })} />
          <div className="flex items-end">
            <Button className="w-full">Add Driver</Button>
          </div>
        </form>
      </Card>

      {loading && <Loader text="Loading drivers" />}

      <Table
        title="Driver Roster"
        description="Safety posture and readiness status"
        loading={loading}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'licenseExpiryDate', label: 'License Expiry', render: (row) => new Date(row.licenseExpiryDate).toLocaleDateString() },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'safetyScore', label: 'Safety Score' },
          { key: 'completionRate', label: 'Completion Rate', render: (row) => `${row.completionRate || 0}%` },
          {
            key: 'action',
            label: 'Action',
            render: (row) => (
              <Button variant="danger" className="!rounded-xl !px-2.5 !py-1.5" onClick={() => removeDriver(row._id)}>
                Delete
              </Button>
            )
          }
        ]}
        rows={drivers}
        getRowId={(row) => row._id}
        searchKeys={['name', 'licenseNumber', 'status']}
      />
    </div>
  );
};

export default DriverManagementPage;
