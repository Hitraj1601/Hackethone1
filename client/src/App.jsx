import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';
import AppLayout from './layouts/AppLayout';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const VehicleRegistryPage = lazy(() => import('./pages/VehicleRegistryPage'));
const TripDispatcherPage = lazy(() => import('./pages/TripDispatcherPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));
const ExpenseFuelPage = lazy(() => import('./pages/ExpenseFuelPage'));
const DriverManagementPage = lazy(() => import('./pages/DriverManagementPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

const App = () => {
  return (
    <Suspense fallback={<div className="p-6"><Loader text="Loading view" /></div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vehicles" element={<VehicleRegistryPage />} />
            <Route path="/trips" element={<TripDispatcherPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/expenses" element={<ExpenseFuelPage />} />
            <Route path="/drivers" element={<DriverManagementPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Fleet Manager', 'Financial Analyst']} />}>
          <Route element={<AppLayout />}>
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
