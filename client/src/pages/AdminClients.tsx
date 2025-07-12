import { useEffect, useState } from "react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isMember: boolean;
  points: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/clients`).then((r) => r.json());
        setClients(res.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Clients</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : clients.length === 0 ? (
        <p className="text-gray-600">No clients found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border-b">Name</th>
                <th className="p-2 border-b">Email</th>
                <th className="p-2 border-b">Phone</th>
                <th className="p-2 border-b text-center">Member</th>
                <th className="p-2 border-b text-center">Points</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="even:bg-gray-50">
                  <td className="p-2 border-b">
                    <span className="font-medium">{c.name}</span>
                  </td>
                  <td className="p-2 border-b">{c.email}</td>
                  <td className="p-2 border-b">{c.phone ?? "-"}</td>
                  <td className="p-2 border-b text-center">
                    {c.isMember ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="p-2 border-b text-center">{c.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}