import { useEffect, useState } from "react";

interface Overview {
  totalBookings: number;
  totalEarnings: number;
  todayBookings: number;
}

interface Appointment {
  id: string;
  dateTime: string;
  service: { title: string };
  client: { name: string };
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [schedule, setSchedule] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const [ovRes, calRes] = await Promise.all([
          fetch(`${API_URL}/dashboard/overview`).then((r) => r.json()),
          fetch(`${API_URL}/calendar?date=${today}`).then((r) => r.json()),
        ]);
        setOverview(ovRes.data);
        setSchedule(calRes.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <>
          {/* KPI cards */}
          {overview && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white border rounded shadow-sm text-center">
                <p className="text-sm text-gray-500">Today Bookings</p>
                <p className="text-xl font-medium">{overview.todayBookings}</p>
              </div>
              <div className="p-4 bg-white border rounded shadow-sm text-center">
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-xl font-medium">{overview.totalBookings}</p>
              </div>
              <div className="p-4 bg-white border rounded shadow-sm text-center">
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-xl font-medium">${(overview.totalEarnings / 100).toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Schedule */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold mt-4">Today Schedule</h3>
            {schedule.length === 0 ? (
              <p className="text-gray-600">No appointments today</p>
            ) : (
              <ul className="space-y-2">
                {schedule.map((appt) => (
                  <li key={appt.id} className="border rounded p-3 bg-white shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-medium">{appt.service.title}</p>
                      <p className="text-gray-600 text-sm">{appt.client.name}</p>
                    </div>
                    <p>
                      {new Date(appt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}