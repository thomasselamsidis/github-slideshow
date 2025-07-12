import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Appointment {
  id: string;
  dateTime: string;
  service: { title: string };
  barber: { name: string };
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [nextAppt, setNextAppt] = useState<Appointment | null>(null);
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [apptRes, userRes] = await Promise.all([
          fetch(`${API_URL}/appointments?status=upcoming`),
          fetch(`${API_URL}/users/me`),
        ]);

        if (apptRes.ok) {
          const json = await apptRes.json();
          setNextAppt(json.data?.[0] ?? null);
        }
        if (userRes.ok) {
          const json = await userRes.json();
          setPoints(json.data?.points ?? null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <section className="space-y-6 max-w-lg mx-auto">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Welcome 👋</h1>
        {points !== null && (
          <p className="text-sm text-gray-600">You have <span className="font-medium">{points}</span> points</p>
        )}
      </header>

      {/* Next appointment card */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : nextAppt ? (
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Next appointment</p>
            <h2 className="text-lg font-medium">{nextAppt.service.title}</h2>
            <p className="text-gray-700">with {nextAppt.barber.name}</p>
            <p className="text-gray-700">
              {new Date(nextAppt.dateTime).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        ) : (
          <p className="text-gray-600">No upcoming appointments</p>
        )}
      </div>

      <Link
        to="/booking"
        className="inline-block bg-accent text-white px-6 py-3 rounded-lg text-center w-full sm:w-auto"
      >
        Book Appointment
      </Link>
    </section>
  );
}