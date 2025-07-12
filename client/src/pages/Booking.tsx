import { Route, Routes, useNavigate } from "react-router-dom";

function SelectService() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Service</h2>
      <ul className="space-y-2">
        {[
          { id: "haircut", title: "Haircut" },
          { id: "beard", title: "Beard Trim" },
        ].map((s) => (
          <li key={s.id}>
            <button
              onClick={() => navigate("barber")}
              className="w-full text-left p-3 border rounded hover:bg-gray-100"
            >
              {s.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return <h2 className="text-xl font-semibold">{title} (coming soon)</h2>;
}

export default function Booking() {
  return (
    <Routes>
      <Route path="/" element={<SelectService />} />
      <Route path="barber" element={<Placeholder title="Choose Barber" />} />
      <Route path="datetime" element={<Placeholder title="Select Date & Time" />} />
      <Route path="confirm" element={<Placeholder title="Confirm" />} />
    </Routes>
  );
}