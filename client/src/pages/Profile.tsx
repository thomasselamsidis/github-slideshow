import { useEffect, useState } from "react";
import { firebaseAuth } from "../firebase";

interface User {
  id: string;
  name: string;
  email: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/users/me`)
      .then((r) => r.json())
      .then((json) => {
        setUser(json.data);
        setName(json.data?.name ?? "");
        setEmail(json.data?.email ?? "");
      })
      .catch(console.error);
  }, []);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      alert("Saved");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    firebaseAuth.signOut().finally(() => {
      window.location.href = "/";
    });
  }

  return (
    <section className="space-y-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold">Profile</h2>

      {/* Personal info */}
      <div className="space-y-2 bg-white border rounded p-4 shadow-sm">
        <label className="block">
          <span className="text-gray-700">Name</span>
          <input
            className="mt-1 block w-full border rounded p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Email</span>
          <input
            className="mt-1 block w-full border rounded p-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <button
          disabled={saving}
          onClick={handleSave}
          className="bg-accent text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Payment method placeholder */}
      <div className="space-y-2 bg-white border rounded p-4 shadow-sm">
        <p className="font-medium">Payment Method</p>
        <p className="text-gray-600">No card on file.</p>
        <button className="bg-accent text-white px-4 py-2 rounded">Add Card</button>
      </div>

      <button onClick={handleLogout} className="text-red-600 underline">
        Log out
      </button>
    </section>
  );
}