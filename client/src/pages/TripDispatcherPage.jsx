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
        <h1 className="section-title">Trip Dispatcher</h1>
        <p className="section-subtitle">Dispatch and track trip lifecycle</p>
      </div>

      <Card>
        <form onSubmit={createTrip} className="grid gap-3 md:grid-cols-3">
          <FloatingInput label="Reference No" value={form.referenceNo} onChange={(e) => setForm({ ...form, referenceNo: e.target.value })} required />
          <FloatingInput label="Origin" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} required />
          <FloatingInput label="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
          <FloatingInput label="Cargo Description" value={form.cargoDescription} onChange={(e) => setForm({ ...form, cargoDescription: e.target.value })} />
          <FloatingInput type="number" min="1" label="Cargo Weight" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} required />
          <FloatingInput type="number" min="1" label="Planned Distance (km)" value={form.plannedDistanceKm} onChange={(e) => setForm({ ...form, plannedDistanceKm: e.target.value })} required />
          <FloatingInput type="number" min="0" label="Revenue" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} />
          <FloatingSelect label="Vehicle" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
            <option value="">Select Available Vehicle</option>
            {availableVehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.model} ({vehicle.licensePlate})
              </option>
            ))}
          </FloatingSelect>
          <FloatingSelect label="Driver" value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} required>
            <option value="">Select Available Driver</option>
            {availableDrivers.map((driver) => (
              <option key={driver._id} value={driver._id}>
                {driver.name}
              </option>
            ))}
          </FloatingSelect>
          <FloatingSelect className="md:col-span-2" label="Trip Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Draft</option>
            <option>Dispatched</option>
          </FloatingSelect>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Create Trip
            </Button>
          </div>
        </form>
      </Card>

      {loading && <Loader text="Loading trips" />}

      <Table
        title="Trip Lifecycle"
        description="Dispatch actions and real-time status"
        loading={loading}
        columns={[
          { key: 'referenceNo', label: 'Ref' },
          { key: 'vehicle', label: 'Vehicle', render: (row) => row.vehicle?.licensePlate || '-' },
          { key: 'driver', label: 'Driver', render: (row) => row.driver?.name || '-' },
          { key: 'route', label: 'Route', render: (row) => `${row.origin} → ${row.destination}` },
          { key: 'cargoWeight', label: 'Cargo' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
              <div className="flex gap-2">
                {row.status !== 'Dispatched' && (
                  <Button variant="secondary" className="!rounded-xl !px-2.5 !py-1.5" onClick={() => updateStatus(row._id, 'Dispatched')}>
                    Dispatch
                  </Button>
                )}
                {row.status === 'Dispatched' && (
                  <Button variant="secondary" className="!rounded-xl !px-2.5 !py-1.5" onClick={() => updateStatus(row._id, 'Completed')}>
                    Complete
                  </Button>
                )}
                {row.status !== 'Completed' && row.status !== 'Cancelled' && (
                  <Button variant="danger" className="!rounded-xl !px-2.5 !py-1.5" onClick={() => updateStatus(row._id, 'Cancelled')}>
                    Cancel
                  </Button>
                )}
              </div>
            )
          }
        ]}
        rows={trips}
        getRowId={(row) => row._id}
        searchKeys={['referenceNo', 'origin', 'destination', 'status']}
      />
    </div>
  );
};

export default TripDispatcherPage;
