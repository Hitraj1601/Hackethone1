import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  Filler,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../services/api';
import Loader from '../components/Loader';
import { exportToCsv } from '../utils/csv';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';

ChartJS.register(LineElement, PointElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip, Filler);

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateWindow, setDateWindow] = useState('30');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/analytics');
      setAnalytics(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <Loader text="Loading analytics" />;

  const totalRevenue = analytics.rows.reduce((sum, row) => sum + Number(row.revenue || 0), 0);
  const totalFuel = analytics.rows.reduce((sum, row) => sum + Number(row.fuelCost || 0), 0);
  const avgRoi = analytics.rows.length
    ? analytics.rows.reduce((sum, row) => sum + Number(row.roi || 0), 0) / analytics.rows.length
    : 0;

  const barData = {
    labels: analytics.chartData.labels,
    datasets: [
      {
        label: 'Fuel Efficiency (km/L)',
        data: analytics.chartData.fuelEfficiency,
        backgroundColor: '#6366f1'
      },
      {
        label: 'ROI (%)',
        data: analytics.chartData.roi,
        backgroundColor: '#10b981'
      }
    ]
  };

  const lineData = {
    labels: analytics.chartData.labels,
    datasets: [
      {
        label: 'Fuel Efficiency (km/L)',
        data: analytics.chartData.fuelEfficiency,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        fill: true,
        tension: 0.35
      }
    ]
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Analytics & ROI</h1>
          <p className="section-subtitle">Fuel efficiency and profitability trends</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input !h-10 !w-36 !py-0" value={dateWindow} onChange={(e) => setDateWindow(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button onClick={() => exportToCsv('fleetflow-analytics.csv', analytics.rows)}>Export CSV</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card glow>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600 dark:text-emerald-300">${totalRevenue.toFixed(2)}</p>
        </Card>
        <Card glow>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Fuel Cost</p>
          <p className="mt-2 text-3xl font-semibold text-indigo-600 dark:text-indigo-300">${totalFuel.toFixed(2)}</p>
        </Card>
        <Card glow>
          <p className="text-sm text-slate-500 dark:text-slate-400">Average ROI</p>
          <p className="mt-2 text-3xl font-semibold text-fuchsia-600 dark:text-fuchsia-300">{(avgRoi * 100).toFixed(2)}%</p>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card className="h-80">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Efficiency trend</p>
          <div className="mt-3 h-64">
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </Card>
        <Card className="h-80">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Fuel vs ROI</p>
          <div className="mt-3 h-64">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </Card>
      </div>

      <Table
        title="Detailed ROI Table"
        description={`Window: last ${dateWindow} days`}
        loading={loading}
        columns={[
          { key: 'vehicle', label: 'Vehicle' },
          { key: 'distanceKm', label: 'Distance (km)' },
          { key: 'liters', label: 'Liters' },
          { key: 'fuelEfficiency', label: 'Fuel Efficiency', render: (row) => `${row.fuelEfficiency} km/L` },
          { key: 'fuelCost', label: 'Fuel Cost', render: (row) => `$${row.fuelCost}` },
          { key: 'maintenanceCost', label: 'Maintenance', render: (row) => `$${row.maintenanceCost}` },
          { key: 'revenue', label: 'Revenue', render: (row) => `$${row.revenue}` },
          { key: 'roi', label: 'ROI', render: (row) => `${(row.roi * 100).toFixed(2)}%` }
        ]}
        rows={analytics.rows}
        getRowId={(row) => row.vehicleId}
        searchKeys={['vehicle']}
      />
    </div>
  );
};

export default AnalyticsPage;
