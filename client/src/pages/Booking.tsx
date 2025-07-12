import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Service {
  id: string;
  title: string;
  duration: number;
  price: number;
}

interface Barber {
  id: string;
  name: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Booking() {
  const navigate = useNavigate();

  const [step, setStep] = useState<"service" | "barber" | "datetime" | "confirm">("service");
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [barber, setBarber] = useState<Barber | null>(null);
  const [datetime, setDatetime] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch services on mount
  useEffect(() => {
    fetch(`${API_URL}/services`)
      .then((r) => r.json())
      .then((json) => setServices(json.data ?? []))
      .catch(console.error);
  }, []);

  // Fetch barbers when service selected
  useEffect(() => {
    if (step === "barber" && barbers.length === 0) {
      fetch(`${API_URL}/users?role=BARBER`)
        .then((r) => r.json())
        .then((json) => setBarbers(json.data ?? []))
        .catch(console.error);
    }
  }, [step]);

  async function handleConfirm() {
    if (!service || !barber || !datetime) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          barberId: barber.id,
          dateTime: new Date(datetime).toISOString(),
        }),
      });
      if (res.ok) {
        navigate("/appointments");
      } else {
        alert("Failed to create appointment");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {step === "service" && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Select Service</h2>
          {services.length === 0 ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            <ul className="space-y-2">
              {services.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => {
                      setService(s);
                      setStep("barber");
                    }}
                    className="w-full text-left p-3 border rounded hover:bg-gray-100"
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {step === "barber" && service && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Choose Barber</h2>
          <p className="text-gray-600">Service: {service.title}</p>
          {barbers.length === 0 ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            <ul className="space-y-2">
              {barbers.map((b) => (
                <li key={b.id}>
                  <button
                    onClick={() => {
                      setBarber(b);
                      setStep("datetime");
                    }}
                    className="w-full text-left p-3 border rounded hover:bg-gray-100"
                  >
                    {b.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {step === "datetime" && service && barber && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Pick Date & Time</h2>
          <p className="text-gray-600">Service: {service.title}</p>
          <p className="text-gray-600">Barber: {barber.name}</p>
          <input
            type="datetime-local"
            className="border rounded p-2 w-full"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setStep("barber")}
              className="flex-1 border rounded p-2 text-center"
            >
              Back
            </button>
            <button
              disabled={!datetime}
              onClick={() => setStep("confirm")}
              className="flex-1 bg-accent text-white rounded p-2 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === "confirm" && service && barber && datetime && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Confirm Appointment</h2>
          <ul className="text-gray-700 space-y-1">
            <li><strong>Service:</strong> {service.title}</li>
            <li><strong>Barber:</strong> {barber.name}</li>
            <li>
              <strong>Date:</strong>{" "}
              {new Date(datetime).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </li>
          </ul>
          <div className="flex gap-2">
            <button onClick={() => setStep("datetime")} className="flex-1 border rounded p-2 text-center">
              Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="flex-1 bg-accent text-white rounded p-2 disabled:opacity-50"
            >
              {submitting ? "Booking..." : "Confirm"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}