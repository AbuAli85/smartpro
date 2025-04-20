export default function AdminPage() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <p className="text-gray-500 mb-4">This is a placeholder for the admin panel.</p>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          Note: This is a simplified version of the admin panel. Authentication and Supabase integration have been
          disabled for now.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Users</h2>
          <p className="text-gray-500">Manage user accounts</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Templates</h2>
          <p className="text-gray-500">Manage contract templates</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Settings</h2>
          <p className="text-gray-500">Configure system settings</p>
        </div>
      </div>
    </main>
  )
}
