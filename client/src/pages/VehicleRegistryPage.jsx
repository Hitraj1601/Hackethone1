import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FloatingInput from '../components/ui/FloatingInput';
import FloatingSelect from '../components/ui/FloatingSelect';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import Table from '../components/ui/Table';

const initialForm = {
  model: '',
  type: 'Truck',
  licensePlate: '',
  maxLoadCapacity: '',
  acquisitionCost: '',
  odometer: ''
};

const VehicleRegistryPage = () => {
  const toast = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [formError, setFormError] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!form.model || !form.licensePlate || !form.maxLoadCapacity || !form.odometer) {
      setFormError('Please complete required fields.');
      return;
    }

    setFormError('');
    try {
      await api.post('/vehicles', {
        ...form,
        maxLoadCapacity: Number(form.maxLoadCapacity),
        acquisitionCost: Number(form.acquisitionCost || 0),
        odometer: Number(form.odometer)
      });
      setForm(initialForm);
      toast.success('Vehicle created');
      fetchVehicles();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create vehicle');
    }
  };

  const toggleOutOfService = async (vehicleId) => {
    try {
      await api.patch(`/vehicles/${vehicleId}/out-of-service`);
      toast.info('Vehicle status updated');
      fetchVehicles();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Update failed');
    }
  };

  const deleteVehicle = async (vehicleId) => {
    try {
      await api.delete(`/vehicles/${vehicleId}`);
      toast.success('Vehicle deleted');
      fetchVehicles();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Delete blocked');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="section-title">Vehicle Registry</h1>
        <p className="section-subtitle">Manage fleet lifecycle and availability</p>
      </div>

      <Card>
        <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-3">
          <FloatingInput label="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          <FloatingSelect label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>Truck</option>
            <option>Van</option>
            <option>Pickup</option>
            <option>Trailer</option>
            <option>Reefer</option>
            <option>Other</option>
          </FloatingSelect>
          <FloatingInput label="License Plate" value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} />
          <FloatingInput type="number" min="1" label="Max Load Capacity" value={form.maxLoadCapacity} onChange={(e) => setForm({ ...form, maxLoadCapacity: e.target.value })} />
          <FloatingInput type="number" min="0" label="Acquisition Cost" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} />
          <FloatingInput type="number" min="0" label="Odometer" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
          <div className="md:col-span-3 flex items-center justify-between">
            {formError ? (
              <motion.p initial={{ x: -8 }} animate={{ x: [0, -6, 6, -4, 4, 0] }} className="text-xs text-rose-500">
                {formError}
              </motion.p>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400">Records sync instantly with backend APIs.</span>
            )}
            <Button type="submit">Add Vehicle</Button>
          </div>
        </form>
      </Card>

      {loading && <Loader text="Loading vehicles" />}

      <Table
        title="Fleet Vehicles"
        description="Operational status and lifecycle controls"
        loading={loading}
        columns={[
          { key: 'model', label: 'Model' },
          { key: 'licensePlate', label: 'Plate' },
          { key: 'maxLoadCapacity', label: 'Capacity' },
          { key: 'odometer', label: 'Odometer' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
              <div className="flex gap-2">
                <Button variant="secondary" className="!rounded-xl !px-2.5 !py-1.5" onClick={() => toggleOutOfService(row._id)}>
                  Toggle OOS
                </Button>
                <Button variant="danger" className="!rounded-xl !px-2.5 !py-1.5" onClick={() => setDeleteId(row._id)}>
                  Delete
                </Button>
              </div>
            )
          }
        ]}
        rows={vehicles}
        getRowId={(row) => row._id}
        searchKeys={['model', 'licensePlate', 'status', 'type']}
      />

      <Modal open={Boolean(deleteId)} onClose={() => setDeleteId(null)} title="Delete vehicle" description="This action cannot be undone.">
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteVehicle(deleteId);
              setDeleteId(null);
            }}
          >
            Confirm delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default VehicleRegistryPage;
