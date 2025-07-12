export default function Profile() {
  return (
    <section className="space-y-4 max-w-md">
      <h2 className="text-xl font-semibold">Profile</h2>
      <div className="space-y-2">
        <label className="block">
          <span className="text-gray-700">Name</span>
          <input className="mt-1 block w-full border rounded p-2" placeholder="Your name" />
        </label>
        <label className="block">
          <span className="text-gray-700">Email</span>
          <input className="mt-1 block w-full border rounded p-2" type="email" placeholder="you@example.com" />
        </label>
        <button className="bg-accent text-white px-4 py-2 rounded">Save</button>
      </div>
    </section>
  );
}