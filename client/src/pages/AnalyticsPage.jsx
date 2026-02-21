import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../services/api';
import Loader from '../components/Loader';
import { exportToCsv } from '../utils/csv';

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip);

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const chartData = {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Analytics & ROI</h1>
          <p className="text-sm text-slate-500">Fuel efficiency and profitability trends</p>
        </div>
        <button className="btn-primary" onClick={() => exportToCsv('fleetflow-analytics.csv', analytics.rows)}>
          Export CSV
        </button>
      </div>

      <div className="card">
        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} height={96} />
      </div>

      <div className="table-wrap">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Distance (km)</th>
              <th className="px-4 py-3">Liters</th>
              <th className="px-4 py-3">Fuel Efficiency</th>
              <th className="px-4 py-3">Fuel Cost</th>
              <th className="px-4 py-3">Maintenance</th>
              <th className="px-4 py-3">Revenue</th>
              <th className="px-4 py-3">ROI</th>
            </tr>
          </thead>
          <tbody>
            {analytics.rows.map((row) => (
              <tr key={row.vehicleId} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">{row.vehicle}</td>
                <td className="px-4 py-3">{row.distanceKm}</td>
                <td className="px-4 py-3">{row.liters}</td>
                <td className="px-4 py-3">{row.fuelEfficiency} km/L</td>
                <td className="px-4 py-3">${row.fuelCost}</td>
                <td className="px-4 py-3">${row.maintenanceCost}</td>
                <td className="px-4 py-3">${row.revenue}</td>
                <td className="px-4 py-3">{(row.roi * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsPage;
