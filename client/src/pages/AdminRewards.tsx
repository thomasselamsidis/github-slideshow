import { useEffect, useState } from "react";

interface Settings {
  pointsPerVisit: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function AdminRewards() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [points, setPoints] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/rewards/settings`).then((r) => r.json());
        const data = res.data ?? { pointsPerVisit: 10 };
        setSettings(data);
        setPoints(data.pointsPerVisit);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function save() {
    setSaving(true);
    try {
      await fetch(`${API_URL}/rewards/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pointsPerVisit: Number(points) }),
      });
      alert("Saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-md mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Rewards Settings</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="bg-white border rounded p-4 shadow-sm space-y-4">
          <div>
            <label className="block font-medium mb-1">Points per completed visit</label>
            <input
              type="number"
              min={1}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="border rounded p-2 w-full"
            />
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="bg-accent text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}
    </section>
  );
}