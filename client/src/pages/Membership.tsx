import { useEffect, useState } from "react";

interface MembershipInfo {
  isMember: boolean;
  activeSince?: string;
  expiresAt?: string;
  points: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Membership() {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<MembershipInfo | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  async function fetchStatus() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/membership`);
      if (res.ok) {
        const json = await res.json();
        setInfo(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  async function handleJoinCancel() {
    if (!info) return;
    const endpoint = info.isMember ? "cancel" : "join";
    const ok = confirm(
      info.isMember ? "Are you sure you want to cancel your membership?" : "Join membership?",
    );
    if (!ok) return;
    await fetch(`${API_URL}/membership/${endpoint}`, { method: "POST" });
    fetchStatus();
  }

  async function handleRedeem() {
    setRedeeming(true);
    try {
      const res = await fetch(`${API_URL}/rewards/redeem`, { method: "POST", body: JSON.stringify({ points: 100 }) });
      if (res.ok) alert("Reward redeemed! 🎉");
      fetchStatus();
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <section className="space-y-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold">Membership</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : info ? (
        <>
          <div className="border rounded p-4 bg-white shadow-sm space-y-2">
            <p>
              Status: {info.isMember ? <span className="text-green-600">Active</span> : <span className="text-red-600">Not a member</span>}
            </p>
            {info.isMember && (
              <p className="text-sm text-gray-600">
                Since {new Date(info.activeSince!).toLocaleDateString()} – renews {new Date(info.expiresAt!).toLocaleDateString()}
              </p>
            )}
            <button
              onClick={handleJoinCancel}
              className="bg-accent text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              {info.isMember ? "Cancel Membership" : "Join Membership"}
            </button>
          </div>

          {/* Points summary */}
          <div className="space-y-2">
            <p className="font-medium">Points: {info.points}</p>
            <div className="w-full h-4 bg-gray-200 rounded">
              <div
                className="h-full bg-accent rounded"
                style={{ width: `${Math.min((info.points / 500) * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">Earn 500 points to claim a free haircut</p>
            <button
              disabled={info.points < 500 || redeeming}
              onClick={handleRedeem}
              className="bg-accent text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {redeeming ? "Processing..." : "Claim Reward"}
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-600">Unable to load membership info</p>
      )}
    </section>
  );
}