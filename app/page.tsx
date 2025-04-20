import { DisableGrammarly } from "./disable-grammarly"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <DisableGrammarly />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Bilingual Contract Generator</h1>
        <p className="mb-4">
          Welcome to the Bilingual Contract Generator. Please navigate to the dashboard to create or manage your
          contracts.
        </p>

        <div className="grid gap-4 md:grid-cols-2 mt-8">
          <a href="/dashboard" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
            <p>View and manage your existing contracts</p>
          </a>

          <a href="/new-contract" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Create New Contract</h2>
            <p>Generate a new bilingual contract</p>
          </a>
        </div>
      </div>
    </main>
  )
}
