import MonitoringDashboard from "@/components/admin/monitoring-dashboard"

export default function MonitoringPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Performance Monitoring</h1>
      <p className="text-gray-500">Track application performance metrics and error rates</p>

      <MonitoringDashboard />
    </div>
  )
}
