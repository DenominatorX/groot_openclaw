// Phase 4 (Frontend) will replace this placeholder.
// Backend API is live at /api/listings, /api/refresh, /api/cron.

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-teal-50 p-8">
      <div className="max-w-lg text-center space-y-4">
        <h1 className="text-4xl font-bold text-teal-700">EchoHome</h1>
        <p className="text-lg text-teal-600">Florida Beach House Finder</p>
        <p className="text-sm text-gray-500">
          Backend API is ready. Frontend coming in Phase 4.
        </p>
        <div className="mt-6 space-y-2 text-left bg-white rounded-xl shadow p-4 text-sm text-gray-700">
          <p className="font-semibold text-gray-900">Available endpoints:</p>
          <code className="block">GET  /api/listings</code>
          <code className="block">POST /api/refresh</code>
          <code className="block">POST /api/cron</code>
        </div>
      </div>
    </main>
  );
}
