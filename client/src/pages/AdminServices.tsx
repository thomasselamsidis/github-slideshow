import { useEffect, useState } from "react";

interface Service {
  id: string;
  title: string;
  duration: number;
  price: number; // cents
  active: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(20); // dollars
  const [savingId, setSavingId] = useState<string | null>(null);

  async function fetchServices() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/services?all=true`).then((r) => r.json());
      setServices(res.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchServices();
  }, []);

  async function addService() {
    const body = { title, duration: Number(duration), price: price * 100 };
    await fetch(`${API_URL}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setTitle("");
    setDuration(30);
    setPrice(20);
    fetchServices();
  }

  async function saveService(s: Service) {
    setSavingId(s.id);
    await fetch(`${API_URL}/services/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: s.title, duration: s.duration, price: s.price }),
    });
    setSavingId(null);
    fetchServices();
  }

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Services</h2>

      {/* Add form */}
      <div className="bg-white border rounded p-4 shadow-sm space-y-2">
        <h3 className="font-medium">Add New Service</h3>
        <div className="flex flex-wrap gap-2 items-end">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded p-2 flex-1 min-w-[120px]"
          />
          <input
            type="number"
            min={1}
            placeholder="Duration (min)"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="border rounded p-2 w-36"
          />
          <input
            type="number"
            min={1}
            placeholder="Price ($)"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="border rounded p-2 w-36"
          />
          <button
            onClick={addService}
            disabled={!title}
            className="bg-accent text-white px-3 py-2 rounded disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : services.length === 0 ? (
        <p className="text-gray-600">No services defined.</p>
      ) : (
        <ul className="space-y-2">
          {services.map((svc) => (
            <ServiceRow key={svc.id} svc={svc} onSave={saveService} saving={savingId === svc.id} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ServiceRow({ svc, onSave, saving }: { svc: Service; onSave: (s: Service) => void; saving: boolean }) {
  const [edit, setEdit] = useState(false);
  const [title, setTitle] = useState(svc.title);
  const [duration, setDuration] = useState(svc.duration);
  const [price, setPrice] = useState(svc.price / 100);

  return (
    <li className="p-3 bg-white border rounded shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      {edit ? (
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded p-2 flex-1 min-w-[120px]"
          />
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="border rounded p-2 w-24"
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="border rounded p-2 w-24"
          />
        </div>
      ) : (
        <div className="flex-1 space-y-1">
          <p className="font-medium">{svc.title}</p>
          <p className="text-gray-600 text-sm">
            {svc.duration} min • ${ (svc.price / 100).toFixed(2) }
          </p>
        </div>
      )}

      {edit ? (
        <div className="flex gap-2">
          <button
            onClick={() => {
              onSave({ ...svc, title, duration, price: price * 100 });
              setEdit(false);
            }}
            disabled={saving || !title}
            className="bg-accent text-white px-3 py-1 rounded disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={() => setEdit(false)} className="border px-3 py-1 rounded">
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setEdit(true)} className="border px-3 py-1 rounded self-start sm:self-auto">
          Edit
        </button>
      )}
    </li>
  );
}