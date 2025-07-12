import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Membership from "./pages/Membership";
import Appointments from "./pages/Appointments";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

function NavBar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded ${isActive ? "bg-accent text-white" : "hover:bg-gray-200"}`;

  return (
    <nav className="flex gap-2 p-2 border-b border-gray-200 overflow-x-auto">
      <NavLink to="/" className={linkClass} end>
        Home
      </NavLink>
      <NavLink to="/booking" className={linkClass}>
        Book
      </NavLink>
      <NavLink to="/membership" className={linkClass}>
        Membership
      </NavLink>
      <NavLink to="/appointments" className={linkClass}>
        Appointments
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        Profile
      </NavLink>
      <NavLink to="/admin" className={linkClass}>
        Dashboard
      </NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/booking/*" element={<Booking />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}