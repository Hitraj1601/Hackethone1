import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VehicleRegistryPage from './pages/VehicleRegistryPage';
import TripDispatcherPage from './pages/TripDispatcherPage';
import MaintenancePage from './pages/MaintenancePage';
import ExpenseFuelPage from './pages/ExpenseFuelPage';
import DriverManagementPage from './pages/DriverManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            <Layout>
              <DashboardPage />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <DashboardPage />
            </Layout>
          }
        />
        <Route
          path="/vehicles"
          element={
            <Layout>
              <VehicleRegistryPage />
            </Layout>
          }
        />
        <Route
          path="/trips"
          element={
            <Layout>
              <TripDispatcherPage />
            </Layout>
          }
        />
        <Route
          path="/maintenance"
          element={
            <Layout>
              <MaintenancePage />
            </Layout>
          }
        />
        <Route
          path="/expenses"
          element={
            <Layout>
              <ExpenseFuelPage />
            </Layout>
          }
        />
        <Route
          path="/drivers"
          element={
            <Layout>
              <DriverManagementPage />
            </Layout>
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Fleet Manager', 'Financial Analyst']} />}>
        <Route
          path="/analytics"
          element={
            <Layout>
              <AnalyticsPage />
            </Layout>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
