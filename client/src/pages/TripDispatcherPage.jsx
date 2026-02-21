import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import StatusPill from '../components/StatusPill';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';

const initialTripForm = {
  referenceNo: '',
  origin: '',
  destination: '',
  cargoDescription: '',
  cargoWeight: '',
  plannedDistanceKm: '',
  revenue: '',
  vehicle: '',
  driver: '',
  status: 'Draft'
};

const TripDispatcherPage = () => {
  const toast = useToast();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(initialTripForm);
  const [loading, setLoading] = useState(true);

  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === 'Available' && !vehicle.outOfService),
    [vehicles]
  );

  const availableDrivers = useMemo(() => {
    const now = new Date();
    return drivers.filter(
      (driver) =>
        driver.status !== 'Suspended' &&
        driver.status !== 'On Trip' &&
        new Date(driver.licenseExpiryDate) >= now
    );
  }, [drivers]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tripRes, vehicleRes, driverRes] = await Promise.all([
        api.get('/trips'),
        api.get('/vehicles'),
        api.get('/drivers')
      ]);

      setTrips(tripRes.data);
      setVehicles(vehicleRes.data);
      setDrivers(driverRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const createTrip = async (event) => {
    event.preventDefault();
    const selectedVehicle = vehicles.find((vehicle) => vehicle._id === form.vehicle);

    if (selectedVehicle && Number(form.cargoWeight) > Number(selectedVehicle.maxLoadCapacity)) {
      toast.error('Cargo weight exceeds vehicle max load capacity');
      return;
    }

    try {
      await api.post('/trips', {
        ...form,
        cargoWeight: Number(form.cargoWeight),
        plannedDistanceKm: Number(form.plannedDistanceKm),
        revenue: Number(form.revenue || 0)
      });
      setForm(initialTripForm);
      toast.success('Trip created');
      fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Trip creation failed');
    }
  };

  const updateStatus = async (tripId, status) => {
    try {
      await api.patch(`/trips/${tripId}/status`, {
        status,
        actualDistanceKm: status === 'Completed' ? 120 : undefined
      });
      toast.info(`Trip marked ${status}`);
      fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update trip');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Trip Dispatcher</h1>
        <p className="text-sm text-slate-500">Dispatch and track trip lifecycle</p>
      </div>

      <form onSubmit={createTrip} className="card grid gap-3 md:grid-cols-3">
        <input className="input" placeholder="Reference No" value={form.referenceNo} onChange={(e) => setForm({ ...form, referenceNo: e.target.value })} required />
        <input className="input" placeholder="Origin" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} required />
        <input className="input" placeholder="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
        <input className="input" placeholder="Cargo Description" value={form.cargoDescription} onChange={(e) => setForm({ ...form, cargoDescription: e.target.value })} />
        <input className="input" type="number" min="1" placeholder="Cargo Weight" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} required />
        <input className="input" type="number" min="1" placeholder="Planned Distance (km)" value={form.plannedDistanceKm} onChange={(e) => setForm({ ...form, plannedDistanceKm: e.target.value })} required />
        <input className="input" type="number" min="0" placeholder="Revenue" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} />
        <select className="input" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
          <option value="">Select Available Vehicle</option>
          {availableVehicles.map((vehicle) => (
            <option key={vehicle._id} value={vehicle._id}>
              {vehicle.model} ({vehicle.licensePlate})
            </option>
          ))}
        </select>
        <select className="input" value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} required>
          <option value="">Select Available Driver</option>
          {availableDrivers.map((driver) => (
            <option key={driver._id} value={driver._id}>
              {driver.name}
            </option>
          ))}
        </select>
        <select className="input md:col-span-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option>Draft</option>
          <option>Dispatched</option>
        </select>
        <button type="submit" className="btn-primary">
          Create Trip
        </button>
      </form>

      {loading ? (
        <Loader text="Loading trips" />
      ) : (
        <div className="table-wrap">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Cargo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip._id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">{trip.referenceNo}</td>
                  <td className="px-4 py-3">{trip.vehicle?.licensePlate}</td>
                  <td className="px-4 py-3">{trip.driver?.name}</td>
                  <td className="px-4 py-3">{trip.origin} → {trip.destination}</td>
                  <td className="px-4 py-3">{trip.cargoWeight}</td>
                  <td className="px-4 py-3"><StatusPill status={trip.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {trip.status !== 'Dispatched' && (
                        <button className="btn-secondary" onClick={() => updateStatus(trip._id, 'Dispatched')}>
                          Dispatch
                        </button>
                      )}
                      {trip.status === 'Dispatched' && (
                        <button className="btn-secondary" onClick={() => updateStatus(trip._id, 'Completed')}>
                          Complete
                        </button>
                      )}
                      {trip.status !== 'Completed' && trip.status !== 'Cancelled' && (
                        <button className="btn-secondary" onClick={() => updateStatus(trip._id, 'Cancelled')}>
                          Cancel
                        </button>
                      )}
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

export default TripDispatcherPage;
