import { useEffect, useState } from "react";

interface Rule {
  id: string;
  day: string; // e.g., "Monday"
  start: string; // HH:MM
  end: string; // HH:MM
}

interface Exception {
  id: string;
  date: string; // YYYY-MM-DD
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function AdminCalendar() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);

  const [day, setDay] = useState("Monday");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [exceptionDate, setExceptionDate] = useState("");

  async function fetchAvailability() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/availability`).then((r) => r.json());
      setRules(res.data?.rules ?? []);
      setExceptions(res.data?.exceptions ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAvailability();
  }, []);

  async function addRule() {
    const body = { day, start, end };
    await fetch(`${API_URL}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    fetchAvailability();
  }

  async function deleteRule(id: string) {
    await fetch(`${API_URL}/availability/${id}`, { method: "DELETE" });
    fetchAvailability();
  }

  async function addException() {
    if (!exceptionDate) return;
    await fetch(`${API_URL}/availability/exception`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: exceptionDate }),
    });
    setExceptionDate("");
    fetchAvailability();
  }

  async function deleteException(id: string) {
    await fetch(`${API_URL}/availability/exception/${id}`, { method: "DELETE" });
    fetchAvailability();
  }

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Calendar Availability</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <>
          {/* Weekly rules */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Weekly Rules</h3>
            {rules.length === 0 ? (
              <p className="text-gray-600">No rules defined.</p>
            ) : (
              <ul className="space-y-2">
                {rules.map((r) => (
                  <li key={r.id} className="p-3 bg-white border rounded flex justify-between items-center">
                    <p>
                      {r.day}: {r.start} – {r.end}
                    </p>
                    <button onClick={() => deleteRule(r.id)} className="text-red-600 text-sm underline">
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add rule form */}
            <div className="flex flex-wrap gap-2 items-end">
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="border rounded p-2"
              >
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="border rounded p-2"
              />
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="border rounded p-2"
              />
              <button onClick={addRule} className="bg-accent text-white px-3 py-2 rounded">
                Add Rule
              </button>
            </div>
          </div>

          {/* Exceptions */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Exceptions (Days Off)</h3>
            {exceptions.length === 0 ? (
              <p className="text-gray-600">No exceptions.</p>
            ) : (
              <ul className="space-y-2">
                {exceptions.map((ex) => (
                  <li key={ex.id} className="p-3 bg-white border rounded flex justify-between items-center">
                    <p>{new Date(ex.date).toLocaleDateString()}</p>
                    <button onClick={() => deleteException(ex.id)} className="text-red-600 text-sm underline">
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex gap-2 items-end">
              <input
                type="date"
                value={exceptionDate}
                onChange={(e) => setExceptionDate(e.target.value)}
                className="border rounded p-2"
              />
              <button
                onClick={addException}
                disabled={!exceptionDate}
                className="bg-accent text-white px-3 py-2 rounded disabled:opacity-50"
              >
                Add Exception
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}