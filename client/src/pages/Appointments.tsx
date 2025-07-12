import { useEffect, useState } from "react";

interface Appointment {
  id: string;
  dateTime: string;
  service: { title: string };
  barber: { name: string };
  status: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Appointments() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [past, setPast] = useState<Appointment[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchAppointments() {
    setLoading(true);
    try {
      const [upRes, pastRes] = await Promise.all([
        fetch(`${API_URL}/appointments?status=upcoming`).then((r) => r.json()),
        fetch(`${API_URL}/appointments?status=past`).then((r) => r.json()),
      ]);
      setUpcoming(upRes.data ?? []);
      setPast(pastRes.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function cancelAppointment(id: string) {
    const ok = confirm("Cancel this appointment?");
    if (!ok) return;
    setProcessingId(id);
    try {
      await fetch(`${API_URL}/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELED" }),
      });
      fetchAppointments();
    } finally {
      setProcessingId(null);
    }
  }

  async function rescheduleAppointment(id: string) {
    const newDate = prompt("Enter new date/time (YYYY-MM-DDTHH:MM):");
    if (!newDate) return;
    setProcessingId(id);
    try {
      await fetch(`${API_URL}/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateTime: new Date(newDate).toISOString() }),
      });
      fetchAppointments();
    } finally {
      setProcessingId(null);
    }
  }

  const currentList = tab === "upcoming" ? upcoming : past;

  return (
    <section className="max-w-lg mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Your Appointments</h2>

      <div className="flex gap-2">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded ${tab === t ? "bg-accent text-white" : "border"}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : currentList.length === 0 ? (
        <p className="text-gray-600">No {tab} appointments</p>
      ) : (
        <ul className="space-y-3">
          {currentList.map((appt) => (
            <li key={appt.id} className="border rounded p-3 bg-white shadow-sm space-y-1">
              <p className="text-sm text-gray-500">{appt.service.title}</p>
              <p className="text-gray-700">with {appt.barber.name}</p>
              <p className="text-gray-700">
                {new Date(appt.dateTime).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>

              {tab === "upcoming" && (
                <div className="flex gap-2 pt-2">
                  <button
                    disabled={processingId === appt.id}
                    onClick={() => rescheduleAppointment(appt.id)}
                    className="flex-1 border rounded p-2 text-center disabled:opacity-50"
                  >
                    Reschedule
                  </button>
                  <button
                    disabled={processingId === appt.id}
                    onClick={() => cancelAppointment(appt.id)}
                    className="flex-1 bg-red-500 text-white rounded p-2 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}