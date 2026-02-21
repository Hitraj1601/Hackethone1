import { useEffect, useState } from 'react';
import api from '../services/api';
import StatusPill from '../components/StatusPill';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';

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
        <h1 className="text-2xl font-semibold text-slate-800">Vehicle Registry</h1>
        <p className="text-sm text-slate-500">Manage fleet lifecycle and availability</p>
      </div>

      <form onSubmit={handleCreate} className="card grid gap-3 md:grid-cols-3">
        <input className="input" placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
        <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option>Truck</option>
          <option>Van</option>
          <option>Pickup</option>
          <option>Trailer</option>
          <option>Reefer</option>
          <option>Other</option>
        </select>
        <input className="input" placeholder="License Plate" value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} required />
        <input className="input" type="number" min="1" placeholder="Max Load Capacity" value={form.maxLoadCapacity} onChange={(e) => setForm({ ...form, maxLoadCapacity: e.target.value })} required />
        <input className="input" type="number" min="0" placeholder="Acquisition Cost" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} />
        <input className="input" type="number" min="0" placeholder="Odometer" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} required />
        <div className="md:col-span-3">
          <button className="btn-primary" type="submit">
            Add Vehicle
          </button>
        </div>
      </form>

      {loading ? (
        <Loader text="Loading vehicles" />
      ) : (
        <div className="table-wrap">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Plate</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Odometer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle._id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">{vehicle.model}</td>
                  <td className="px-4 py-3">{vehicle.licensePlate}</td>
                  <td className="px-4 py-3">{vehicle.maxLoadCapacity}</td>
                  <td className="px-4 py-3">{vehicle.odometer}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={vehicle.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="btn-secondary" onClick={() => toggleOutOfService(vehicle._id)}>
                        Toggle OOS
                      </button>
                      <button className="btn-secondary" onClick={() => deleteVehicle(vehicle._id)}>
                        Delete
                      </button>
                    </div>
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

export default VehicleRegistryPage;
