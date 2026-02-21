import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import FuelLog from '../models/FuelLog.js';

dotenv.config({ path: '.env' });

const users = [
  { name: 'Maya Fleet', email: 'manager@fleetflow.io', password: 'Password123!', role: 'Fleet Manager' },
  { name: 'Dev Dispatcher', email: 'dispatcher@fleetflow.io', password: 'Password123!', role: 'Dispatcher' },
  { name: 'Sonia Safety', email: 'safety@fleetflow.io', password: 'Password123!', role: 'Safety Officer' },
  { name: 'Finn Finance', email: 'finance@fleetflow.io', password: 'Password123!', role: 'Financial Analyst' }
];

const runSeed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany(),
      Vehicle.deleteMany(),
      Driver.deleteMany(),
      Trip.deleteMany(),
      MaintenanceLog.deleteMany(),
      FuelLog.deleteMany()
    ]);

    for (const userData of users) {
      await User.create(userData);
    }

    const createdVehicles = await Vehicle.insertMany([
      {
        model: 'Volvo FH16',
        type: 'Truck',
        licensePlate: 'FL-1024',
        maxLoadCapacity: 32000,
        acquisitionCost: 185000,
        odometer: 120430,
        status: 'Available'
      },
      {
        model: 'Mercedes Sprinter',
        type: 'Van',
        licensePlate: 'FL-2291',
        maxLoadCapacity: 3500,
        acquisitionCost: 62000,
        odometer: 60440,
        status: 'In Shop'
      },
      {
        model: 'Ford Ranger XL',
        type: 'Pickup',
        licensePlate: 'FL-8820',
        maxLoadCapacity: 1200,
        acquisitionCost: 41000,
        odometer: 78990,
        status: 'On Trip'
      }
    ]);

    const createdDrivers = await Driver.insertMany([
      {
        name: 'Ravi Kumar',
        licenseNumber: 'DL-88811',
        licenseExpiryDate: new Date('2027-11-10'),
        status: 'On Duty',
        safetyScore: 93
      },
      {
        name: 'Neha Singh',
        licenseNumber: 'DL-55120',
        licenseExpiryDate: new Date('2025-06-15'),
        status: 'Suspended',
        safetyScore: 72
      },
      {
        name: 'Aman Verma',
        licenseNumber: 'DL-90012',
        licenseExpiryDate: new Date('2028-02-22'),
        status: 'On Trip',
        safetyScore: 97
      }
    ]);

    const createdTrips = await Trip.insertMany([
      {
        referenceNo: 'TRP-1001',
        origin: 'Delhi Hub',
        destination: 'Jaipur Depot',
        cargoDescription: 'Automotive parts',
        cargoWeight: 1800,
        plannedDistanceKm: 280,
        actualDistanceKm: 286,
        revenue: 2900,
        vehicle: createdVehicles[2]._id,
        driver: createdDrivers[2]._id,
        status: 'Dispatched',
        dispatchedAt: new Date()
      },
      {
        referenceNo: 'TRP-1002',
        origin: 'Pune Yard',
        destination: 'Mumbai Terminal',
        cargoDescription: 'Retail pallets',
        cargoWeight: 900,
        plannedDistanceKm: 165,
        actualDistanceKm: 170,
        revenue: 2200,
        vehicle: createdVehicles[0]._id,
        driver: createdDrivers[0]._id,
        status: 'Completed',
        dispatchedAt: new Date('2026-01-10'),
        completedAt: new Date('2026-01-11')
      }
    ]);

    await MaintenanceLog.insertMany([
      {
        vehicle: createdVehicles[1]._id,
        serviceType: 'Brake line inspection',
        notes: 'Fluid leak in rear right line',
        cost: 640,
        serviceDate: new Date('2026-02-10'),
        resolved: false
      }
    ]);

    await FuelLog.insertMany([
      {
        vehicle: createdVehicles[0]._id,
        trip: createdTrips[1]._id,
        liters: 62,
        cost: 104,
        date: new Date('2026-01-11')
      },
      {
        vehicle: createdVehicles[2]._id,
        trip: createdTrips[0]._id,
        liters: 41,
        cost: 75,
        date: new Date('2026-02-12')
      }
    ]);

    console.log('Seed data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

runSeed().finally(async () => {
  await mongoose.connection.close();
});
