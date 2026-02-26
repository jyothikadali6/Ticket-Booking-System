function Topbar() {
  const role = localStorage.getItem("role");

  return (
    <div className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold">
        Welcome 👋
      </h1>

      <span className="text-sm text-gray-500">
        Role: {role}
      </span>
    </div>
  );
}

export default Topbar;
